
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Activity, Heart, BarChart3, LineChart, TrendingUp, MoreHorizontal, Filter, Info, Droplet, Moon, Clock, AlertCircle, Star } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';

// Mock data for visualizations
const cycleData = [
  { day: '1', flow: 4, symptoms: 5, mood: 2 },
  { day: '2', flow: 4, symptoms: 5, mood: 2 },
  { day: '3', flow: 3, symptoms: 4, mood: 2 },
  { day: '4', flow: 3, symptoms: 3, mood: 3 },
  { day: '5', flow: 2, symptoms: 2, mood: 3 },
  { day: '6', flow: 1, symptoms: 1, mood: 4 },
  { day: '7', flow: 0, symptoms: 1, mood: 4 },
  { day: '8', flow: 0, symptoms: 0, mood: 4 },
  { day: '9', flow: 0, symptoms: 0, mood: 5 },
  { day: '10', flow: 0, symptoms: 0, mood: 5 },
  { day: '11', flow: 0, symptoms: 0, mood: 5 },
  { day: '12', flow: 0, symptoms: 0, mood: 5 },
  { day: '13', flow: 0, symptoms: 0, mood: 5 },
  { day: '14', flow: 0, symptoms: 0, mood: 5 },
  { day: '15', flow: 0, symptoms: 0, mood: 5 },
  { day: '16', flow: 0, symptoms: 1, mood: 4 },
  { day: '17', flow: 0, symptoms: 1, mood: 4 },
  { day: '18', flow: 0, symptoms: 2, mood: 3 },
  { day: '19', flow: 0, symptoms: 2, mood: 3 },
  { day: '20', flow: 0, symptoms: 2, mood: 3 },
  { day: '21', flow: 0, symptoms: 3, mood: 3 },
  { day: '22', flow: 0, symptoms: 3, mood: 2 },
  { day: '23', flow: 0, symptoms: 4, mood: 2 },
  { day: '24', flow: 0, symptoms: 4, mood: 2 },
  { day: '25', flow: 0, symptoms: 3, mood: 2 },
  { day: '26', flow: 0, symptoms: 3, mood: 3 },
  { day: '27', flow: 1, symptoms: 4, mood: 2 },
  { day: '28', flow: 3, symptoms: 4, mood: 2 },
];

const symptomsPieData = [
  { name: 'Cramps', value: 25, color: '#8b5cf6' },
  { name: 'Headache', value: 18, color: '#14b8a6' },
  { name: 'Bloating', value: 20, color: '#f43f5e' },
  { name: 'Fatigue', value: 22, color: '#a78bfa' },
  { name: 'Others', value: 15, color: '#7c3aed' },
];

const moodTrendData = [
  { month: 'Jan', average: 3.2 },
  { month: 'Feb', average: 3.5 },
  { month: 'Mar', average: 3.8 },
  { month: 'Apr', average: 3.3 },
  { month: 'May', average: 4.1 },
  { month: 'Jun', average: 3.9 },
];

const cycleLengthData = [
  { cycle: 1, days: 29 },
  { cycle: 2, days: 28 },
  { cycle: 3, days: 30 },
  { cycle: 4, days: 28 },
  { cycle: 5, days: 28 },
  { cycle: 6, days: 29 },
];

const insights = [
  {
    title: 'Cycle Prediction',
    description: 'Your next period is expected to start in 3 days based on your 28-day average cycle.',
    icon: <Calendar className="h-5 w-5" />,
    color: 'text-lavender-500',
    bgColor: 'bg-lavender-100',
  },
  {
    title: 'Pattern Detected',
    description: 'Your headaches tend to occur 2-3 days before your period starts. Consider preventative measures.',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'text-teal-500',
    bgColor: 'bg-teal-100',
  },
  {
    title: 'Mood Improvement',
    description: 'Your mood scores have been improving over the last 3 months. Keep up with your wellness routine!',
    icon: <Heart className="h-5 w-5" />,
    color: 'text-coral-500',
    bgColor: 'bg-coral-100',
  },
];

// Helper function to format date ranges
const formatDateRange = (days: number) => {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - days);
  
  return `${pastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('30');
  const dateRange = formatDateRange(parseInt(timeRange));
  
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
            
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
        
        {/* Health Overview Cards */}
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
                    <div className="text-2xl font-semibold">Day 16</div>
                    <div className="text-sm text-muted-foreground">of average 28 day cycle</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-lavender-100 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-lavender-500"></div>
                  </div>
                </div>
                <div className="text-sm mt-2 p-2 rounded-lg bg-muted flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 text-lavender-500 flex-shrink-0 mt-0.5" />
                  <span>Predicted ovulation in 2 days</span>
                </div>
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
                  {['Mild Cramps', 'Headache', 'Fatigue'].map((symptom, i) => (
                    <div key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                      {symptom}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="text-sm font-medium mb-1">Symptom Frequency</div>
                  <div className="flex items-center space-x-1">
                    <div className="h-2 bg-teal-500 rounded-full w-3/5"></div>
                    <div className="h-2 bg-teal-300 rounded-full w-1/5"></div>
                    <div className="h-2 bg-teal-200 rounded-full w-1/5"></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Tracked for {dateRange}</span>
                    <span>12 symptoms logged</span>
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
                      <div className="text-2xl font-semibold mr-2">4.2</div>
                      <div className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">+0.3</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Above average</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Energy Level</div>
                    <div className="flex items-center">
                      <div className="text-2xl font-semibold mr-2">3.8</div>
                      <div className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">-0.2</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Slightly below average</div>
                  </div>
                </div>
                <div className="mt-4 h-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cycleData.slice(-7)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Area type="monotone" dataKey="mood" stroke="#f43f5e" fill="#fecdd3" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Insights Cards */}
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
        
        {/* Main Charts Section */}
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
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={cycleData}
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
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="p-3 rounded-lg bg-lavender-50 border border-lavender-200">
                    <div className="text-sm text-lavender-700 font-medium mb-1">Avg. Cycle Length</div>
                    <div className="text-2xl font-semibold flex items-center">
                      <span>28</span>
                      <span className="text-sm ml-1 text-muted-foreground">days</span>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-teal-50 border border-teal-200">
                    <div className="text-sm text-teal-700 font-medium mb-1">Avg. Period Length</div>
                    <div className="text-2xl font-semibold flex items-center">
                      <span>5.2</span>
                      <span className="text-sm ml-1 text-muted-foreground">days</span>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-coral-50 border border-coral-200">
                    <div className="text-sm text-coral-700 font-medium mb-1">Consistency Score</div>
                    <div className="text-2xl font-semibold flex items-center">
                      <span>92</span>
                      <span className="text-sm ml-1 text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Cycle Length History</CardTitle>
                <CardDescription>Your cycle length over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={cycleLengthData}
                      margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="cycle" label={{ value: "Cycle Number", position: "insideBottom", offset: -5 }} />
                      <YAxis domain={[25, 31]} label={{ value: "Days", angle: -90, position: "insideLeft" }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 'bold' }}
                        formatter={(value) => [`${value} days`, "Length"]}
                      />
                      <Bar dataKey="days" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
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
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={symptomsPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {symptomsPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value) => [`${value} instances`, "Frequency"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Symptom Timeline</CardTitle>
                  <CardDescription>When symptoms occur in your cycle</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Cramps', days: [1, 2, 3, 4], color: 'bg-lavender-500', icon: <Activity className="h-4 w-4" /> },
                      { name: 'Headache', days: [1, 2, 26, 27, 28], color: 'bg-teal-500', icon: <Thermometer className="h-4 w-4" /> },
                      { name: 'Bloating', days: [25, 26, 27, 28, 1, 2], color: 'bg-coral-500', icon: <Droplet className="h-4 w-4" /> },
                      { name: 'Fatigue', days: [1, 2, 3, 24, 25, 26, 27, 28], color: 'bg-yellow-500', icon: <Moon className="h-4 w-4" /> },
                    ].map((symptom, idx) => (
                      <div key={idx} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-md ${symptom.color.replace('500', '100')}`}>
                              <div className="text-white">{symptom.icon}</div>
                            </div>
                            <span className="font-medium">{symptom.name}</span>
                          </div>
                          <span className="text-sm">{symptom.days.length} days</span>
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
                                    symptom.days.includes(i + 1) ? `${symptom.color} rounded-sm h-3 mx-0.5` : ""
                                  )}
                                >
                                  {((i + 1) % 7 === 0) && <span className="text-[10px] text-muted-foreground">{i + 1}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Symptom Correlations</CardTitle>
                <CardDescription>Potential connections between your symptoms</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="mood" className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Mood Trends</CardTitle>
                <CardDescription>Your mood patterns over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={moodTrendData}
                      margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[1, 5]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`${value.toFixed(1)}`, "Average Mood"]}
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
                </div>
                
                <div className="mt-4 p-4 rounded-lg border border-coral-200 bg-coral-50">
                  <div className="flex items-start">
                    <TrendingUp className="h-5 w-5 mr-3 text-coral-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-coral-700">Positive trend detected</h4>
                      <p className="text-sm text-coral-600 mt-1">Your mood scores have been steadily improving over the last 3 months, with a 15% increase from your baseline.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Mood-Cycle Correlation</CardTitle>
                  <CardDescription>How your mood changes throughout your cycle</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={cycleData}
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
                        { phase: "Menstrual", days: "1-5", score: 2.8, color: "bg-coral-500" },
                        { phase: "Follicular", days: "6-14", score: 4.2, color: "bg-teal-500" },
                        { phase: "Ovulation", days: "15", score: 4.5, color: "bg-green-500" },
                        { phase: "Luteal", days: "16-28", score: 3.5, color: "bg-lavender-500" },
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
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Energy Level Analysis</CardTitle>
                  <CardDescription>Daily energy level variations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium mb-1">Today's Energy</div>
                        <div className="text-2xl font-semibold">4.2</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Weekly Average</div>
                        <div className="text-2xl font-semibold">3.8</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Monthly Average</div>
                        <div className="text-2xl font-semibold">3.6</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Daily Energy Fluctuation</div>
                      <div className="space-y-2">
                        {[
                          { day: "Monday", value: 3.2 },
                          { day: "Tuesday", value: 3.5 },
                          { day: "Wednesday", value: 4.0 },
                          { day: "Thursday", value: 4.2 },
                          { day: "Friday", value: 3.8 },
                          { day: "Saturday", value: 3.5 },
                          { day: "Sunday", value: 3.7 },
                        ].map((day, i) => (
                          <div key={i} className="flex items-center">
                            <div className="w-20 text-sm">{day.day}</div>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-coral-400 to-lavender-500 rounded-full" 
                                style={{ width: `${(day.value / 5) * 100}%` }}
                              ></div>
                            </div>
                            <div className="w-10 text-right text-sm font-medium">{day.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="flex items-start">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                          Your energy levels tend to peak in the morning and decline in the late afternoon. Consider scheduling high-focus activities before 2 PM.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
