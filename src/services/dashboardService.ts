
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, parseISO, subDays, eachDayOfInterval, differenceInDays } from 'date-fns';
import { CycleEntry, MoodEntry, SymptomEntry, CycleStatistics } from './trackerService';

export interface DashboardData {
  cycleEntries: CycleEntry[];
  moodEntries: MoodEntry[];
  symptoms: SymptomEntry[];
  statistics: CycleStatistics | null;
  consistencyScore: number;
  cycleChartData: {
    day: string;
    flow: number;
    symptoms: number;
    mood: number;
  }[];
  symptomsPieData: {
    name: string;
    value: number;
    color: string;
  }[];
  moodTrendData: {
    month: string;
    average: number;
  }[];
  cycleLengthData: {
    cycle: number;
    days: number;
  }[];
}

const symptomColors = {
  'Cramps': '#8b5cf6',
  'Headache': '#14b8a6',
  'Bloating': '#f43f5e',
  'Fatigue': '#a78bfa',
  'Backache': '#ec4899',
  'Nausea': '#10b981',
  'Spotting': '#f97316',
  'Breast Tenderness': '#8b5cf6',
  'Mood Swings': '#06b6d4',
  'Acne': '#f59e0b',
  'Others': '#7c3aed'
};

export const fetchDashboardData = async (days: number = 30): Promise<DashboardData> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    const userId = userData.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Time range for data
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');
    
    // Fetch cycle entries
    const { data: cycleData, error: cycleError } = await supabase
      .from('cycle_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', formattedStartDate)
      .lte('date', formattedEndDate)
      .order('date', { ascending: true });
    
    if (cycleError) throw cycleError;
    
    // Fetch mood entries
    const { data: moodData, error: moodError } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', formattedStartDate)
      .lte('date', formattedEndDate)
      .order('date', { ascending: true });
    
    if (moodError) throw moodError;
    
    // Fetch symptoms
    const { data: symptomsData, error: symptomsError } = await supabase
      .from('symptom_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', formattedStartDate)
      .lte('date', formattedEndDate);
    
    if (symptomsError) throw symptomsError;
    
    // Fetch cycle statistics
    const { data: statsData, error: statsError } = await supabase
      .from('cycle_statistics')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (statsError) throw statsError;
    
    // Generate cycle chart data
    const cycleChartData = processChartData(cycleData, moodData, symptomsData);
    
    // Generate symptoms pie data
    const symptomsPieData = processSymptomsPieData(symptomsData);
    
    // Generate mood trend data over last 6 months
    const moodTrendData = await processMoodTrendData(userId);
    
    // Generate cycle length data
    const cycleLengthData = await processCycleLengthData(userId);
    
    // Calculate consistency score based on real data
    const consistencyScore = calculateConsistencyScore(
      cycleData || [], 
      moodData || [], 
      symptomsData || [],
      days,
      statsData
    );
    
    return {
      cycleEntries: cycleData || [],
      moodEntries: moodData || [],
      symptoms: symptomsData || [],
      statistics: statsData,
      consistencyScore,
      cycleChartData,
      symptomsPieData,
      moodTrendData,
      cycleLengthData
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Calculate a consistency score based on tracking data
const calculateConsistencyScore = (
  cycleData: CycleEntry[],
  moodData: MoodEntry[],
  symptomsData: SymptomEntry[],
  timeRange: number,
  statistics?: CycleStatistics | null
): number => {
  // If no data, return 0 score
  if (cycleData.length === 0 && moodData.length === 0 && symptomsData.length === 0) {
    return 0;
  }
  
  // 1. Tracking frequency (40% of score)
  const uniqueTrackedDates = new Set<string>();
  
  cycleData.forEach(entry => uniqueTrackedDates.add(entry.date as string));
  moodData.forEach(entry => uniqueTrackedDates.add(entry.date as string));
  
  // Get unique dates from symptoms
  const symptomDates = new Set<string>();
  symptomsData.forEach(entry => symptomDates.add(entry.date as string));
  
  // Add symptom dates to total tracked dates
  symptomDates.forEach(date => uniqueTrackedDates.add(date));
  
  // Calculate tracking frequency score (out of 40 points)
  const trackedDaysCount = uniqueTrackedDates.size;
  const expectedDaysToTrack = Math.min(timeRange, 30); // We expect tracking for at most 30 days
  const trackingFrequencyScore = Math.min(40, Math.round((trackedDaysCount / expectedDaysToTrack) * 40));
  
  // 2. Data completeness (30% of score)
  // Calculate what percentage of tracked days have all three data types (cycle, mood, and at least one symptom)
  let completeDataDays = 0;
  
  uniqueTrackedDates.forEach(date => {
    const hasCycleData = cycleData.some(entry => entry.date === date);
    const hasMoodData = moodData.some(entry => entry.date === date);
    const hasSymptomData = symptomsData.some(entry => entry.date === date);
    
    if (hasCycleData && hasMoodData && hasSymptomData) {
      completeDataDays++;
    }
  });
  
  const completenessScore = Math.round((completeDataDays / Math.max(1, uniqueTrackedDates.size)) * 30);
  
  // 3. Cycle regularity (30% of score)
  let regularityScore = 0;
  
  if (statistics && statistics.average_cycle_length && cycleData.length > 0) {
    // Fetch more historical cycle data to assess regularity
    const cycleStartDates: Date[] = [];
    const flowDays = cycleData.filter(entry => entry.flow_intensity !== 'none');
    
    if (flowDays.length > 0) {
      // Sort flow days by date
      const sortedFlowDays = [...flowDays].sort((a, b) => {
        const dateA = new Date(a.date as string);
        const dateB = new Date(b.date as string);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Find period start dates (first day of consecutive flow days)
      let lastDate: string | null = null;
      
      sortedFlowDays.forEach(entry => {
        const currentDate = entry.date as string;
        if (!lastDate || differenceInDays(parseISO(currentDate), parseISO(lastDate)) > 3) {
          cycleStartDates.push(parseISO(currentDate));
        }
        lastDate = currentDate;
      });
      
      // Calculate cycle length variation
      if (cycleStartDates.length >= 2) {
        const cycleLengths: number[] = [];
        
        for (let i = 1; i < cycleStartDates.length; i++) {
          cycleLengths.push(differenceInDays(cycleStartDates[i], cycleStartDates[i - 1]));
        }
        
        if (cycleLengths.length > 0) {
          // Calculate standard deviation
          const avgCycleLength = cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length;
          const squaredDiffs = cycleLengths.map(len => Math.pow(len - avgCycleLength, 2));
          const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / squaredDiffs.length;
          const stdDev = Math.sqrt(avgSquaredDiff);
          
          // Calculate regularity score based on standard deviation
          // Lower standard deviation = more regular cycles = higher score
          const variationCoefficient = (stdDev / avgCycleLength) * 100;
          
          if (variationCoefficient <= 5) {
            regularityScore = 30; // Very regular (variation < 5%)
          } else if (variationCoefficient <= 10) {
            regularityScore = 25; // Regular (variation 5-10%)
          } else if (variationCoefficient <= 15) {
            regularityScore = 20; // Somewhat regular (variation 10-15%)
          } else if (variationCoefficient <= 25) {
            regularityScore = 15; // Slightly irregular (variation 15-25%)
          } else {
            regularityScore = 10; // Irregular (variation > 25%)
          }
        } else {
          regularityScore = 10; // Default score if calculation isn't possible
        }
      } else if (statistics && statistics.average_cycle_length) {
        regularityScore = 15; // Default score if there's at least some statistics
      }
    } else if (statistics && statistics.average_cycle_length) {
      regularityScore = 15; // Default score if there's at least some statistics
    }
  } else if (cycleData.length > 0) {
    regularityScore = 10; // Some cycle data but not enough for statistics
  }
  
  // Calculate final score
  const totalScore = trackingFrequencyScore + completenessScore + regularityScore;
  
  return totalScore;
};

// Process data for cycle chart
const processChartData = (
  cycleData: CycleEntry[], 
  moodData: MoodEntry[], 
  symptomsData: SymptomEntry[]
) => {
  const dateRange = 28; // Default to 28 days for menstrual cycle visualization
  const endDate = new Date();
  const startDate = subDays(endDate, dateRange - 1);
  
  // Create all days in the range
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Map flow intensity to numeric values
  const flowIntensityMap: Record<string, number> = {
    'none': 0,
    'light': 1,
    'medium': 2,
    'heavy': 3,
    'very_heavy': 4
  };
  
  // Create chart data for each day
  return days.map((day, index) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    const dayNumber = (index + 1).toString();
    
    // Find cycle entry for this day
    const cycleEntry = cycleData.find(entry => entry.date === formattedDate);
    const flowValue = cycleEntry ? flowIntensityMap[cycleEntry.flow_intensity] : 0;
    
    // Find mood entry for this day
    const moodEntry = moodData.find(entry => entry.date === formattedDate);
    const moodValue = moodEntry?.mood_score || 0;
    
    // Count symptoms for this day
    const daySymptoms = symptomsData.filter(entry => entry.date === formattedDate);
    const symptomsValue = Math.min(Math.ceil(daySymptoms.length / 2), 5); // Normalize to 0-5 range
    
    return {
      day: dayNumber,
      flow: flowValue,
      symptoms: symptomsValue,
      mood: moodValue
    };
  });
};

// Process symptoms for pie chart
const processSymptomsPieData = (symptomsData: SymptomEntry[]) => {
  const symptomCounts: Record<string, number> = {};
  
  // Count occurrences of each symptom type
  symptomsData.forEach(symptom => {
    if (symptomCounts[symptom.symptom_type]) {
      symptomCounts[symptom.symptom_type]++;
    } else {
      symptomCounts[symptom.symptom_type] = 1;
    }
  });
  
  // Convert to pie chart format
  const pieData = Object.entries(symptomCounts)
    .map(([name, value]) => ({
      name,
      value,
      color: symptomColors[name as keyof typeof symptomColors] || '#7c3aed'
    }))
    .sort((a, b) => b.value - a.value);
  
  // Limit to top 5 symptoms, group others
  if (pieData.length > 5) {
    const top4 = pieData.slice(0, 4);
    const others = pieData.slice(4);
    const othersSum = others.reduce((sum, item) => sum + item.value, 0);
    
    return [
      ...top4,
      { name: 'Others', value: othersSum, color: '#7c3aed' }
    ];
  }
  
  return pieData;
};

// Process mood data over 6 months
const processMoodTrendData = async (userId: string) => {
  const months = [];
  const today = new Date();
  
  // Generate last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push(format(date, 'MMM'));
  }
  
  // Fetch mood data for last 6 months
  const sixMonthsAgo = format(subDays(today, 180), 'yyyy-MM-dd');
  
  const { data: moodData, error } = await supabase
    .from('mood_entries')
    .select('date, mood_score')
    .eq('user_id', userId)
    .gte('date', sixMonthsAgo)
    .order('date', { ascending: true });
  
  if (error) throw error;
  
  // Calculate monthly averages
  const monthlyAverages: Record<string, { sum: number, count: number }> = {};
  
  moodData?.forEach(entry => {
    const month = format(parseISO(entry.date), 'MMM');
    if (!monthlyAverages[month]) {
      monthlyAverages[month] = { sum: 0, count: 0 };
    }
    if (entry.mood_score) {
      monthlyAverages[month].sum += entry.mood_score;
      monthlyAverages[month].count++;
    }
  });
  
  // Create final mood trend data
  return months.map(month => {
    const data = monthlyAverages[month];
    const average = data && data.count > 0 ? Number((data.sum / data.count).toFixed(1)) : 3.0;
    return { month, average };
  });
};

// Process cycle length data
const processCycleLengthData = async (userId: string) => {
  // Fetch all cycle entries to find period start dates
  const { data: cycleData, error } = await supabase
    .from('cycle_entries')
    .select('date, flow_intensity')
    .eq('user_id', userId)
    .not('flow_intensity', 'eq', 'none')
    .order('date', { ascending: true });
  
  if (error) throw error;
  
  if (!cycleData || cycleData.length === 0) {
    // Return default data if no entries exist
    return Array.from({ length: 6 }, (_, i) => ({
      cycle: i + 1,
      days: 28
    }));
  }
  
  // Find period start dates (days where flow begins after none)
  const periodStartDates: string[] = [];
  let lastDate: string | null = null;
  
  cycleData.forEach(entry => {
    if (!lastDate || parseISO(entry.date).getTime() - parseISO(lastDate).getTime() > 3 * 24 * 60 * 60 * 1000) {
      periodStartDates.push(entry.date);
    }
    lastDate = entry.date;
  });
  
  // Calculate cycle lengths
  const cycleLengths: number[] = [];
  
  for (let i = 1; i < periodStartDates.length; i++) {
    const start = parseISO(periodStartDates[i - 1]);
    const end = parseISO(periodStartDates[i]);
    const days = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    cycleLengths.push(days);
  }
  
  // Format data for chart (last 6 cycles or fewer)
  return cycleLengths.slice(-6).map((days, index) => ({
    cycle: index + 1,
    days
  }));
};
