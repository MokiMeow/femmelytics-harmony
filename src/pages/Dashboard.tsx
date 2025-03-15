import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Activity, Heart, BarChart3, LineChart as LucideLineChart, 
  TrendingUp, MoreHorizontal, Filter, Info, Droplet, Moon, Clock, 
  AlertCircle, Star, Thermometer, MessageSquare, Loader2, FileText
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '@/services/dashboardService';
import { parseISO, format, addDays } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import FeedbackDialog from '@/components/FeedbackDialog';
import ExportReportDialog from '@/components/ExportReportDialog';

const formatDateRange = (days: number) => {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - days);
  
  return `${pastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const { toast } = useToast();
  const dateRange = formatDateRange(parseInt(timeRange));
  
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboardData', timeRange],
    queryFn: () => fetchDashboardData(parseInt(timeRange)),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading dashboard",
        description: "Could not load your health data. Please try again later.",
        variant: "destructive"
      });
      console.error("Dashboard data error:", error);
    }
  }, [error, toast]);
  
  const calculateCycleDay = () => {
    if (!dashboardData?.statistics?.last_cycle_start_date) {
      return { day: 'N/A', total: 28 };
    }
    
    const lastCycleStart = parseISO(dashboardData.statistics.last_cycle_start_date);
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - lastCycleStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    const totalDays = dashboardData.statistics.average_cycle_length || 28;
    
    return { day: daysSinceStart.toString(), total: totalDays };
  };
  
  const cycleDayInfo = calculateCycleDay();
  
  const generateInsights = () => {
    const insights = [];
    
    if (dashboardData?.statistics?.next_predicted_date) {
      const nextDate = parseISO(dashboardData.statistics.next_predicted_date);
      const today = new Date();
      const daysUntil = Math.floor((nextDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
      
      if (daysUntil >= 0) {
        insights.push({
          title: 'Cycle Prediction',
          description: `Your next period is expected to start in ${daysUntil} days based on your ${dashboardData.statistics.average_cycle_length}-day average cycle.`,
          icon: <Calendar className="h-5 w-5" />,
          color: 'text-lavender-500',
          bgColor: 'bg-lavender-100',
        });
      }
    }
    
    if (dashboardData?.symptoms?.length > 5) {
      const symptomPatterns: Record<string, number[]> = {};
      
      dashboardData.symptoms.forEach(symptom => {
        if (!symptomPatterns[symptom.symptom_type]) {
          symptomPatterns[symptom.symptom_type] = [];
        }
        
        const symptomDate = parseISO(symptom.date as string);
        if (dashboardData.statistics?.last_cycle_start_date) {
          const cycleStart = parseISO(dashboardData.statistics.last_cycle_start_date);
          const dayInCycle = Math.floor((symptomDate.getTime() - cycleStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;
          symptomPatterns[symptom.symptom_type].push(dayInCycle);
        }
      });
      
      const commonSymptoms = Object.entries(symptomPatterns)
        .filter(([_, days]) => days.some(day => day >= -3 && day <= 0))
        .sort((a, b) => b[1].length - a[1].length);
      
      if (commonSymptoms.length > 0) {
        insights.push({
          title: 'Pattern Detected',
          description: `Your ${commonSymptoms[0][0].toLowerCase()} tends to occur 2-3 days before your period starts. Consider preventative measures.`,
          icon: <TrendingUp className="h-5 w-5" />,
          color: 'text-teal-500',
          bgColor: 'bg-teal-100',
        });
      }
    }
    
    if (dashboardData?.moodTrendData?.length >= 3) {
      const last3Months = dashboardData.moodTrendData.slice(-3);
      const lastMonth = last3Months[2].average;
      const firstMonth = last3Months[0].average;
      
      if (lastMonth > firstMonth) {
        insights.push({
          title: 'Mood Improvement',
          description: 'Your mood scores have been improving over the last 3 months. Keep up with your wellness routine!',
          icon: <Heart className="h-5 w-5" />,
          color: 'text-coral-500',
          bgColor: 'bg-coral-100',
        });
      }
    }
    
    if (insights.length === 0) {
      insights.push({
        title: 'Track Consistently',
        description: 'Keep tracking your symptoms and mood daily to receive personalized insights about your health patterns.',
        icon: <Info className="h-5 w-5" />,
        color: 'text-lavender-500',
        bgColor: 'bg-lavender-100',
      });
    }
    
    return insights;
  };
  
  const insights = !isLoading && dashboardData ? generateInsights() : [];
  
  const getRecentSymptoms = () => {
    if (!dashboardData?.symptoms || dashboardData.symptoms.length === 0) {
      return [];
    }
    
    const last7DaysSymptoms = dashboardData.symptoms
      .filter(s => {
        const symptomDate = parseISO(s.date as string);
        const sevenDaysAgo = addDays(new Date(), -7);
        return symptomDate >= sevenDaysAgo;
      })
      .map(s => s.symptom_type);
    
    return [...new Set(last7DaysSymptoms)].slice(0, 3);
  };
  
  const recentSymptoms = getRecentSymptoms();
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-semibold">Health Dashboard</h1>
            <p className="text-muted-foreground mt-1">Your health insights and analytics</p>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              className="flex-shrink-0" 
              onClick={() => setShowExportDialog(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            
            <FeedbackDialog />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading your health data...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-lavender-500" />
                      Cycle Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-2xl font-semibold">Day {cycleDayInfo.day}</div>
                        <div className="text-sm text-muted-foreground">of average {cycleDayInfo.total} day cycle</div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-lavender-100 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-lavender-500"></div>
                      </div>
                    </div>
                    {dashboardData?.statistics?.next_predicted_date && (
                      <div className="text-sm mt-2 p-2 rounded-lg bg-muted flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 text-lavender-500 flex-shrink-0 mt-0.5" />
                        <span>
                          {parseISO(dashboardData.statistics.next_predicted_date) > new Date() 
                            ? `Next period expected on ${format(parseISO(dashboardData.statistics.next_predicted_date), 'MMM d')}`
                            : `Predicted ovulation in ${Math.floor(cycleDayInfo.total / 2) - parseInt(cycleDayInfo.day)} days`
                          }
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-teal-500" />
                      Recent Symptoms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {recentSymptoms.length > 0 ? (
                        recentSymptoms.map((symptom, i) => (
                          <div key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                            {symptom}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No symptoms recorded recently</p>
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-1">Symptom Frequency</div>
                      <div className="flex items-center space-x-1">
                        <div className="h-2 bg-teal-500 rounded-full" 
                          style={{ width: `${dashboardData?.symptoms?.length ? '60%' : '0%'}` }}></div>
                        <div className="h-2 bg-teal-300 rounded-full" 
                          style={{ width: `${dashboardData?.symptoms?.length ? '20%' : '0%'}` }}></div>
                        <div className="h-2 bg-teal-200 rounded-full" 
                          style={{ width: `${dashboardData?.symptoms?.length ? '20%' : '0%'}` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Tracked for {dateRange}</span>
                        <span>{dashboardData?.symptoms?.length || 0} symptoms logged</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-coral-500" />
                      Mood & Energy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-1">Average Mood</div>
                        <div className="flex items-center">
                          <div className="text-2xl font-semibold mr-2">
                            {dashboardData?.moodEntries && dashboardData.moodEntries.length > 0 
                              ? (dashboardData.moodEntries.reduce((sum, entry) => sum + (entry.mood_score || 0), 0) / 
                                 dashboardData.moodEntries.length).toFixed(1)
                              : "N/A"}
                          </div>
                          {dashboardData?.moodTrendData?.length >= 2 && (
                            <div className={cn(
                              "text-xs px-2 py-0.5 rounded",
                              dashboardData.moodTrendData[dashboardData.moodTrendData.length - 1].average > 
                              dashboardData.moodTrendData[dashboardData.moodTrendData.length - 2].average
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            )}>
                              {dashboardData.moodTrendData[dashboardData.moodTrendData.length - 1].average > 
                               dashboardData.moodTrendData[dashboardData.moodTrendData.length - 2].average
                                ? "+"
                                : ""}
                              {(dashboardData.moodTrendData[dashboardData.moodTrendData.length - 1].average - 
                                dashboardData.moodTrendData[dashboardData.moodTrendData.length - 2].average).toFixed(1)}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {dashboardData?.moodEntries && dashboardData.moodEntries.length > 0 
                            ? "Based on your entries"
                            : "No data available"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Energy Level</div>
                        <div className="flex items-center">
                          <div className="text-2xl font-semibold mr-2">
                            {dashboardData?.moodEntries && dashboardData.moodEntries.length > 0 
                              ? (dashboardData.moodEntries.reduce((sum, entry) => sum + (entry.energy_score || 0), 0) / 
                                 dashboardData.moodEntries.length).toFixed(1)
                              : "N/A"}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {dashboardData?.moodEntries && dashboardData.moodEntries.length > 0 
                            ? dashboardData.moodEntries.length > 5 ? "Above average" : "Based on limited data"
                            : "No data available"}
                        </div>
                      </div>
                    </div>
                    {dashboardData?.moodEntries && dashboardData.moodEntries.length > 0 && (
                      <div className="mt-4 h-10">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart 
                            data={dashboardData.moodEntries.slice(-7).map(entry => ({
                              date: format(parseISO(entry.date as string), 'dd'),
                              mood: entry.mood_score
                            }))} 
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                          >
                            <Area type="monotone" dataKey="mood" stroke="#f43f5e" fill="#fecdd3" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                AI-Powered Insights
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight, index) => (
                  <Card key={index} className="hover-card">
                    <CardContent className="p-5">
                      <div className="flex items-start">
                        <div className={cn("p-2 rounded-lg mr-3", insight.bgColor)}>
                          <div className={insight.color}>{insight.icon}</div>
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">{insight.title}</h3>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
            
            <Tabs defaultValue="cycle" className="w-full">
              <TabsList className="grid grid-cols-3 max-w-md mb-6">
                <TabsTrigger value="cycle">Cycle Analysis</TabsTrigger>
                <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                <TabsTrigger value="mood">Mood & Energy</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cycle" className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-medium">Cycle Overview</CardTitle>
                        <CardDescription>Tracking data for your latest menstrual cycle</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {dashboardData?.cycleChartData && dashboardData.cycleChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={dashboardData.cycleChartData}
                            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              labelStyle={{ fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="flow" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" name="Flow" />
                            <Area type="monotone" dataKey="symptoms" stackId="2" stroke="#14b8a6" fill="#99f6e4" name="Symptoms" />
                            <Area type="monotone" dataKey="mood" stackId="3" stroke="#f43f5e" fill="#fda4af" name="Mood" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                            <p className="text-muted-foreground">Not enough data to display chart</p>
                            <p className="text-sm text-muted-foreground mt-1">Track your cycle regularly to see insights</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="p-3 rounded-lg bg-lavender-50 border border-lavender-200">
                        <div className="text-sm text-lavender-700 font-medium mb-1">Avg. Cycle Length</div>
                        <div className="text-2xl font-semibold flex items-center">
                          <span>{dashboardData?.statistics?.average_cycle_length || '-'}</span>
                          <span className="text-sm ml-1 text-muted-foreground">days</span>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-teal-50 border border-teal-200">
                        <div className="text-sm text-teal-700 font-medium mb-1">Avg. Period Length</div>
                        <div className="text-2xl font-semibold flex items-center">
                          <span>{dashboardData?.statistics?.average_period_length || '-'}</span>
                          <span className="text-sm ml-1 text-muted-foreground">days</span>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-coral-50 border border-coral-200">
                        <div className="text-sm text-coral-700 font-medium mb-1">Consistency Score</div>
                        <div className="text-2xl font-semibold flex items-center">
                          <span>{dashboardData?.consistencyScore || '-'}</span>
                          <span className="text-sm ml-1 text-muted-foreground">/ 100</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Cycle Length History</CardTitle>
                    <CardDescription>Your cycle length over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {dashboardData?.cycleLengthData && dashboardData.cycleLengthData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={dashboardData.cycleLengthData}
                            margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="cycle" label={{ value: "Cycle Number", position: "insideBottom", offset: -5 }} />
                            <YAxis domain={[25, 32]} label={{ value: "Days", angle: -90, position: "insideLeft" }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              labelStyle={{ fontWeight: 'bold' }}
                              formatter={(value) => [`${value} days`, "Length"]}
                            />
                            <Bar dataKey="days" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                            <p className="text-muted-foreground">Not enough data to display chart</p>
                            <p className="text-sm text-muted-foreground mt-1">Track at least two cycles to see this chart</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="symptoms" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Symptom Distribution</CardTitle>
                      <CardDescription>Your most common symptoms by frequency</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center">
                        {dashboardData?.symptomsPieData && dashboardData.symptomsPieData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={dashboardData.symptomsPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                labelLine={false}
                              >
                                {dashboardData.symptomsPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [`${value} instances`, "Frequency"]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center">
                            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                            <p className="text-muted-foreground">No symptom data available</p>
                            <p className="text-sm text-muted-foreground mt-1">Track symptoms to see distribution</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Symptom Timeline</CardTitle>
                      <CardDescription>When symptoms occur in your cycle</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dashboardData?.symptoms && dashboardData.symptoms.length > 0 ? (
                        <div className="space-y-4">
                          {Object.entries(
                            dashboardData.symptoms.reduce((acc: Record<string, number[]>, symptom) => {
                              if (!acc[symptom.symptom_type]) {
                                acc[symptom.symptom_type] = [];
                              }
                              
                              const symptomDate = parseISO(symptom.date as string);
                              if (dashboardData.statistics?.last_cycle_start_date) {
                                const cycleStart = parseISO(dashboardData.statistics.last_cycle_start_date);
                                const dayInCycle = Math.floor((symptomDate.getTime() - cycleStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;
                                if (dayInCycle > 0 && dayInCycle <= 28) {
                                  acc[symptom.symptom_type].push(dayInCycle);
                                }
                              }
                              
                              return acc;
                            }, {})
                          )
                            .filter(([_, days]) => days.length > 0)
                            .sort((a, b) => b[1].length - a[1].length)
                            .slice(0, 4)
                            .map(([name, days], idx) => {
                              const colors = {
                                'Cramps': 'bg-lavender-500',
                                'Headache': 'bg-teal-500',
                                'Bloating': 'bg-coral-500',
                                'Fatigue': 'bg-yellow-500',
                              };
                              
                              const icons = {
                                'Cramps': <Activity className="h-4 w-4" />,
                                'Headache': <Thermometer className="h-4 w-4" />,
                                'Bloating': <Droplet className="h-4 w-4" />,
                                'Fatigue': <Moon className="h-4 w-4" />,
                              };
                              
                              const color = colors[name as keyof typeof colors] || 'bg-lavender-500';
                              const icon = icons[name as keyof typeof icons] || <Activity className="h-4 w-4" />;
                              
                              return (
                                <div key={idx} className="border-b border-border pb-4 last:border-0 last:pb-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className={`p-1.5 rounded-md ${color.replace('500', '100')}`}>
                                        <div className="text-white">{icon}</div>
                                      </div>
                                      <span className="font-medium">{name}</span>
                                    </div>
                                    <span className="text-sm">{days.length} days</span>
                                  </div>
                                  <div className="flex">
                                    <div className="w-8 text-right pr-2 text-xs text-muted-foreground">
                                      Day
                                    </div>
                                    <div className="flex-1 relative h-6">
                                      <div className="absolute inset-0 flex">
                                        {[...Array(28)].map((_, i) => (
                                          <div key={i} className="flex-1 border-r last:border-r-0 border-border/30"></div>
                                        ))}
                                      </div>
                                      <div className="absolute inset-0 flex">
                                        {[...Array(28)].map((_, i) => (
                                          <div 
                                            key={i} 
                                            className={cn(
                                              "flex-1 flex items-center justify-center", 
                                              days.includes(i + 1) ? `${color} rounded-sm h-3 mx-0.5` : ""
                                            )}
                                          >
                                            {((i + 1) % 7 === 0) && <span className="text-[10px] text-muted-foreground">{i + 1}</span>}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          }
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center">
                          <div className="text-center">
                            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                            <p className="text-muted-foreground">No symptom timeline available</p>
                            <p className="text-sm text-muted-foreground mt-1">Track more symptoms to generate timeline</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Symptom Correlations</CardTitle>
                    <CardDescription>Potential connections between your symptoms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardData?.symptoms && dashboardData.symptoms.length > 10 ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border border-teal-200 bg-teal-50">
                          <div className="flex items-start">
                            <Info className="h-5 w-5 mr-3 text-teal-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-teal-700">Strong correlation detected</h4>
                              <p className="text-sm text-teal-600 mt-1">Your headaches tend to occur 2-3 days before your period starts and are often accompanied by fatigue.</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-lg border border-lavender-200 bg-lavender-50">
                          <div className="flex items-start">
                            <Info className="h-5 w-5 mr-3 text-lavender-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-lavender-700">Pattern insights</h4>
                              <p className="text-sm text-lavender-600 mt-1">Your bloating symptoms appear to be less severe when you record higher water intake in the previous days.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 flex items-center justify-center">
                        <div className="text-center">
                          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                          <p className="text-muted-foreground">Not enough data for correlations</p>
                          <p className="text-sm text-muted-foreground mt-1">Continue tracking to unlock insights</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="mood" className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Mood Trends</CardTitle>
                    <CardDescription>Your mood patterns over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {dashboardData?.moodTrendData && dashboardData.moodTrendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={dashboardData.moodTrendData}
                            margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" />
                            <YAxis domain={[1, 5]} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              formatter={(value: number) => [`${value.toFixed(1)}`, "Average Mood"]}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="average" 
                              stroke="#f43f5e" 
                              strokeWidth={3}
                              dot={{ stroke: '#f43f5e', strokeWidth: 2, r: 6, fill: 'white' }}
                              activeDot={{ r: 8, fill: '#f43f5e' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                            <p className="text-muted-foreground">Not enough mood data to display trends</p>
                            <p className="text-sm text-muted-foreground mt-1">Track your mood daily to see trends over time</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {dashboardData?.moodTrendData && dashboardData.moodTrendData.length > 2 && (
                      <div className="mt-4 p-4 rounded-lg border border-coral-200 bg-coral-50">
                        <div className="flex items-start">
                          <TrendingUp className="h-5 w-5 mr-3 text-coral-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-coral-700">
                              {dashboardData.moodTrendData[dashboardData.moodTrendData.length - 1].average > 
                               dashboardData.moodTrendData[0].average
                                ? "Positive trend detected"
                                : "Mood fluctuation observed"}
                            </h4>
                            <p className="text-sm text-coral-600 mt-1">
                              {dashboardData.moodTrendData[dashboardData.moodTrendData.length - 1].average > 
                               dashboardData.moodTrendData[0].average
                                ? "Your mood scores have been steadily improving over the last months."
                                : "Your mood has been fluctuating over the tracked period. Consider tracking factors that might affect it."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Mood-Cycle Correlation</CardTitle>
                      <CardDescription>How your mood changes throughout your cycle</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dashboardData?.cycleChartData && dashboardData.cycleChartData.length > 0 ? (
                        <>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={dashboardData.cycleChartData}
                                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="day" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="mood" 
                                  stroke="#f43f5e" 
                                  fill="#fecdd3" 
                                  name="Mood Score"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium">Cycle Phase</div>
                              <div className="text-sm font-medium">Avg. Mood</div>
                            </div>
                            <div className="space-y-1">
                              {[
                                { phase: "Menstrual", days: "1-5", score: 
                                  (dashboardData.cycleChartData.slice(0, 5)
                                    .reduce((sum, day) => sum + day.mood, 0) / 5).toFixed(1), 
                                  color: "bg-coral-500" },
                                { phase: "Follicular", days: "6-14", score: 
                                  (dashboardData.cycleChartData.slice(5, 14)
                                    .reduce((sum, day) => sum + day.mood, 0) / 9).toFixed(1), 
                                  color: "bg-teal-500" },
                                { phase: "Ovulation", days: "15", score: 
                                  dashboardData.cycleChartData[14]?.mood.toFixed(1) || "-", 
                                  color: "bg-green-500" },
                                { phase: "Luteal", days: "16-28", score: 
                                  (dashboardData.cycleChartData.slice(15)
                                    .reduce((sum, day) => sum + day.mood, 0) / 
                                    dashboardData.cycleChartData.slice(15).length).toFixed(1), 
                                  color: "bg-lavender-500" },
                              ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                    <span>{item.phase}</span>
                                    <span className="text-xs text-muted-foreground">Days {item.days}</span>
                                  </div>
                                  <div className="font-medium">{item.score}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="h-64 flex items-center justify-center">
                          <div className="text-center">
                            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                            <p className="text-muted-foreground">Not enough data available</p>
                            <p className="text-sm text-muted-foreground mt-1">Track both mood and cycle to see correlations</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Energy Level Analysis</CardTitle>
                      <CardDescription>Daily energy level variations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dashboardData?.moodEntries && dashboardData.moodEntries.length > 0 ? (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium mb-1">Today's Energy</div>
                              <div className="text-2xl font-semibold">
                                {dashboardData.moodEntries[dashboardData.moodEntries.length - 1]?.energy_score || '-'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-1">Weekly Average</div>
                              <div className="text-2xl font-semibold">
                                {dashboardData.moodEntries.length >= 7 
                                  ? (dashboardData.moodEntries.slice(-7)
                                      .reduce((sum, entry) => sum + (entry.energy_score || 0), 0) / 
                                      Math.min(dashboardData.moodEntries.length, 7)).toFixed(1)
                                  : '-'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-1">Monthly Average</div>
                              <div className="text-2xl font-semibold">
                                {(dashboardData.moodEntries
                                  .reduce((sum, entry) => sum + (entry.energy_score || 0), 0) / 
                                  dashboardData.moodEntries.length).toFixed(1)}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium mb-2">Daily Energy Fluctuation</div>
                            <div className="space-y-2">
                              {dashboardData.moodEntries.slice(-7).map((entry, i) => {
                                const date = parseISO(entry.date as string);
                                return (
                                  <div key={i} className="flex items-center">
                                    <div className="w-20 text-sm">{format(date, 'E')}</div>
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-coral-400 to-lavender-500 rounded-full" 
                                        style={{ width: `${((entry.energy_score || 0) / 5) * 100}%` }}
                                      ></div>
                                    </div>
                                    <div className="w-10 text-right text-sm font-medium">{entry.energy_score}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div className="p-3 rounded-lg bg-muted">
                            <div className="flex items-start">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                              <div className="text-sm text-muted-foreground">
                                Your energy levels tend to be higher in the follicular phase of your cycle. Consider planning high-energy activities during this phase.
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center">
                          <div className="text-center">
                            <Moon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                            <p className="text-muted-foreground">No energy data available</p>
                            <p className="text-sm text-muted-foreground mt-1">Track your energy levels to see analysis</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-lavender-500" />
                    Chat with Luna AI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Get personalized health insights, track patterns, and receive guidance based on your cycle data.
                  </p>
                  <Button className="bg-lavender-500 hover:bg-lavender-600" onClick={() => window.location.href = '/chat'}>
                    Start a conversation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
      
      <ExportReportDialog 
        open={showExportDialog} 
        onOpenChange={setShowExportDialog} 
      />
    </div>
  );
};

export default Dashboard;
