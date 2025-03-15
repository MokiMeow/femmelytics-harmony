
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchRecentEntries } from "@/services/trackerService";
import { addDays, format, parseISO, isSameDay } from "date-fns";

const CycleInsightsDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["recentEntries"],
    queryFn: () => fetchRecentEntries(90),
  });

  const formatCycleData = () => {
    if (!data?.cycleEntries || data.cycleEntries.length === 0) return [];
    
    // Map flow intensity to numeric values for visualization
    const intensityMap = {
      none: 0,
      light: 1,
      medium: 2,
      heavy: 3,
      very_heavy: 4,
    };
    
    return data.cycleEntries.map(entry => ({
      date: format(parseISO(entry.date), 'MMM dd'),
      intensity: intensityMap[entry.flow_intensity],
      intensityLabel: entry.flow_intensity,
    }));
  };

  const formatMoodData = () => {
    if (!data?.moodEntries || data.moodEntries.length === 0) return [];
    
    return data.moodEntries.map(entry => ({
      date: format(parseISO(entry.date), 'MMM dd'),
      mood: entry.mood_score || 0,
      energy: entry.energy_score || 0,
    }));
  };

  const getSymptomStats = () => {
    if (!data?.symptoms || data.symptoms.length === 0) return [];
    
    // Count occurrence of each symptom
    const symptomCounts = data.symptoms.reduce((acc, symptom) => {
      acc[symptom.symptom_type] = (acc[symptom.symptom_type] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to array for chart
    return Object.entries(symptomCounts).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getPeriodPrediction = () => {
    if (!data?.statistics?.next_predicted_date) return null;
    
    const predictedDate = parseISO(data.statistics.next_predicted_date);
    const daysUntil = Math.ceil((predictedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return "Your period was predicted to start recently. Log your flow to improve predictions.";
    if (daysUntil === 0) return "Your period is predicted to start today.";
    if (daysUntil === 1) return "Your period is predicted to start tomorrow.";
    return `Your period is predicted to start in ${daysUntil} days (${format(predictedDate, 'MMM dd')}).`;
  };

  const getCycleStatistics = () => {
    if (!data?.statistics) return { avgCycle: '—', avgPeriod: '—', lastPeriod: '—', nextPeriod: '—' };
    
    return {
      avgCycle: data.statistics.average_cycle_length 
        ? `${data.statistics.average_cycle_length} days` 
        : '—',
      avgPeriod: data.statistics.average_period_length 
        ? `${data.statistics.average_period_length} days` 
        : '—',
      lastPeriod: data.statistics.last_cycle_start_date 
        ? format(parseISO(data.statistics.last_cycle_start_date), 'MMM dd, yyyy') 
        : '—',
      nextPeriod: data.statistics.next_predicted_date 
        ? format(parseISO(data.statistics.next_predicted_date), 'MMM dd, yyyy') 
        : '—',
    };
  };

  const COLORS = ['#FF8A80', '#EA80FC', '#8C9EFF', '#80D8FF', '#A7FFEB', '#CCFF90'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading insights. Please try again later.
      </div>
    );
  }

  const cycleData = formatCycleData();
  const moodData = formatMoodData();
  const symptomStats = getSymptomStats();
  const prediction = getPeriodPrediction();
  const statistics = getCycleStatistics();

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cycle">Cycle</TabsTrigger>
          <TabsTrigger value="mood">Mood</TabsTrigger>
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Cycle Prediction</CardTitle>
              <CardDescription>Based on your tracking history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4 text-primary">
                <CalendarIcon className="h-5 w-5" />
                <span className="font-medium">{prediction || 'Not enough data for prediction yet'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Cycle Length</p>
                  <p className="text-lg font-medium">{statistics.avgCycle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Period Length</p>
                  <p className="text-lg font-medium">{statistics.avgPeriod}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Period</p>
                  <p className="text-lg font-medium">{statistics.lastPeriod}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Period</p>
                  <p className="text-lg font-medium">{statistics.nextPeriod}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Mood</CardTitle>
              </CardHeader>
              <CardContent className="h-48">
                {moodData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moodData.slice(-7)} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                      <XAxis dataKey="date" fontSize={10} />
                      <YAxis domain={[0, 10]} fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="mood" name="Mood" fill="#EA80FC" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="energy" name="Energy" fill="#8C9EFF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No mood data recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Common Symptoms</CardTitle>
              </CardHeader>
              <CardContent className="h-48">
                {symptomStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={symptomStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name }) => name}
                        labelLine={false}
                      >
                        {symptomStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No symptoms recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="cycle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cycle Flow Intensity</CardTitle>
              <CardDescription>View your period flow patterns over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {cycleData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cycleData} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                    <YAxis 
                      domain={[0, 4]}
                      ticks={[0, 1, 2, 3, 4]}
                      tickFormatter={(value) => {
                        const labels = ['None', 'Light', 'Medium', 'Heavy', 'Very Heavy'];
                        return labels[value] || '';
                      }}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        const labels = ['None', 'Light', 'Medium', 'Heavy', 'Very Heavy'];
                        return [labels[Number(value)], 'Flow Intensity'];
                      }}
                    />
                    <Bar 
                      dataKey="intensity" 
                      fill="#FF8A80" 
                      radius={[4, 4, 0, 0]}
                      className="fill-primary"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No cycle data recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mood" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mood & Energy Trends</CardTitle>
              <CardDescription>Track how your mood and energy levels change throughout your cycle</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {moodData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moodData} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Bar dataKey="mood" name="Mood" fill="#EA80FC" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="energy" name="Energy" fill="#8C9EFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No mood data recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="symptoms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Symptom Analysis</CardTitle>
              <CardDescription>Discover your most common symptoms</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {symptomStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={symptomStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {symptomStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} occurrences`, 'Frequency']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No symptoms recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CycleInsightsDashboard;
