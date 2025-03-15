
import { supabase } from '@/integrations/supabase/client';
import { addDays, format, parseISO, subDays } from 'date-fns';

export interface CycleEntry {
  id?: string;
  date: Date | string;
  flow_intensity: 'none' | 'light' | 'medium' | 'heavy' | 'very_heavy';
  cycle_phase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | null;
  cycle_day?: number | null;
  notes?: string | null;
}

export interface MoodEntry {
  id?: string;
  date: Date | string;
  mood_score: number;
  energy_score: number;
  notes?: string | null;
}

export interface SymptomEntry {
  id?: string;
  date: Date | string;
  symptom_type: string;
  severity: number;
}

export interface CycleStatistics {
  average_cycle_length: number | null;
  average_period_length: number | null;
  last_cycle_start_date: string | null;
  next_predicted_date: string | null;
}

// Save tracking data
export const saveTrackingData = async (
  date: Date,
  flowIntensity: 'none' | 'light' | 'medium' | 'heavy' | 'very_heavy',
  moodScore: number,
  energyScore: number,
  symptoms: string[],
  notes: string
) => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Insert or update cycle entry
  const { error: cycleError } = await supabase
    .from('cycle_entries')
    .upsert({
      user_id: userId,
      date: formattedDate,
      flow_intensity: flowIntensity,
      notes: notes,
    }, {
      onConflict: 'user_id,date',
    });

  if (cycleError) throw cycleError;

  // Insert or update mood entry
  const { error: moodError } = await supabase
    .from('mood_entries')
    .upsert({
      user_id: userId,
      date: formattedDate,
      mood_score: moodScore,
      energy_score: energyScore,
      notes: notes,
    }, {
      onConflict: 'user_id,date',
    });

  if (moodError) throw moodError;

  // Delete existing symptoms for this date
  const { error: deleteError } = await supabase
    .from('symptom_entries')
    .delete()
    .eq('user_id', userId)
    .eq('date', formattedDate);

  if (deleteError) throw deleteError;

  // Insert new symptoms
  if (symptoms.length > 0) {
    const symptomEntries = symptoms.map(symptom => ({
      user_id: userId,
      date: formattedDate,
      symptom_type: symptom,
      severity: 1, // Default severity
    }));

    const { error: symptomError } = await supabase
      .from('symptom_entries')
      .insert(symptomEntries);

    if (symptomError) throw symptomError;
  }

  // Update cycle statistics
  await updateCycleStatistics(userId);

  return { success: true };
};

// Fetch entry for a specific date
export const fetchDayEntry = async (date: Date) => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Fetch cycle entry
  const { data: cycleData, error: cycleError } = await supabase
    .from('cycle_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', formattedDate)
    .maybeSingle();

  if (cycleError) throw cycleError;

  // Fetch mood entry
  const { data: moodData, error: moodError } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', formattedDate)
    .maybeSingle();

  if (moodError) throw moodError;

  // Fetch symptoms
  const { data: symptomsData, error: symptomsError } = await supabase
    .from('symptom_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', formattedDate);

  if (symptomsError) throw symptomsError;

  return {
    cycle: cycleData,
    mood: moodData,
    symptoms: symptomsData,
  };
};

// Fetch entries for dashboard
export const fetchRecentEntries = async (days: number = 30) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

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

  return {
    cycleEntries: cycleData || [],
    moodEntries: moodData || [],
    symptoms: symptomsData || [],
    statistics: statsData,
  };
};

// Update cycle statistics based on all entries
const updateCycleStatistics = async (userId: string) => {
  // Fetch all cycle entries for this user
  const { data: cycleData, error: cycleError } = await supabase
    .from('cycle_entries')
    .select('date, flow_intensity')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (cycleError) throw cycleError;

  if (!cycleData || cycleData.length === 0) return;

  // Find period start dates (days with flow > none)
  const periodStartDates: string[] = [];
  let lastFlowDate: string | null = null;

  cycleData.forEach((entry, index) => {
    if (entry.flow_intensity !== 'none') {
      if (!lastFlowDate || (lastFlowDate && parseISO(entry.date).getTime() - parseISO(lastFlowDate).getTime() > 3 * 24 * 60 * 60 * 1000)) {
        periodStartDates.push(entry.date);
      }
      lastFlowDate = entry.date;
    }
  });

  // Calculate average cycle length if we have at least 2 period starts
  let avgCycleLength = null;
  if (periodStartDates.length >= 2) {
    let totalDays = 0;
    for (let i = 1; i < periodStartDates.length; i++) {
      const startDate = parseISO(periodStartDates[i - 1]);
      const endDate = parseISO(periodStartDates[i]);
      const days = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      totalDays += days;
    }
    avgCycleLength = Math.round(totalDays / (periodStartDates.length - 1));
  }

  // Calculate average period length
  let avgPeriodLength = null;
  if (periodStartDates.length > 0) {
    const periodLengths: number[] = [];
    
    for (const startDate of periodStartDates) {
      let periodLength = 1; // Start with 1 day (the start date itself)
      let currentDate = startDate;
      
      // Look for consecutive days with flow
      let foundNonFlow = false;
      let daysChecked = 0;
      
      while (!foundNonFlow && daysChecked < 10) { // Check up to 10 days
        const nextDate = format(addDays(parseISO(currentDate), 1), 'yyyy-MM-dd');
        const nextEntry = cycleData.find(e => e.date === nextDate);
        
        if (nextEntry && nextEntry.flow_intensity !== 'none') {
          periodLength++;
          currentDate = nextDate;
        } else {
          foundNonFlow = true;
        }
        
        daysChecked++;
      }
      
      periodLengths.push(periodLength);
    }
    
    if (periodLengths.length > 0) {
      avgPeriodLength = Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length);
    }
  }

  // Calculate next predicted period start
  let nextPredictedDate = null;
  if (avgCycleLength && periodStartDates.length > 0) {
    const lastPeriodStart = parseISO(periodStartDates[periodStartDates.length - 1]);
    nextPredictedDate = format(addDays(lastPeriodStart, avgCycleLength), 'yyyy-MM-dd');
  }

  // Update or insert statistics
  const { error: statsError } = await supabase
    .from('cycle_statistics')
    .upsert({
      user_id: userId,
      average_cycle_length: avgCycleLength,
      average_period_length: avgPeriodLength,
      last_cycle_start_date: periodStartDates.length > 0 ? periodStartDates[periodStartDates.length - 1] : null,
      next_predicted_date: nextPredictedDate,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (statsError) throw statsError;
};
