
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fetchActiveMedications } from './medicationService';

export const fetchCycleData = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase
    .from('cycle_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date', { ascending: true });
    
  if (error) throw error;
  return data || [];
};

export const fetchSymptomsData = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase
    .from('symptom_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date', { ascending: true });
    
  if (error) throw error;
  return data || [];
};

export const fetchMoodData = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date', { ascending: true });
    
  if (error) throw error;
  return data || [];
};

export const fetchMedicationHistoryData = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase
    .from('medication_history')
    .select('*, medications(name, dosage, frequency)')
    .eq('user_id', userId)
    .gte('taken_at', startDate.toISOString())
    .lte('taken_at', endDate.toISOString())
    .order('taken_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

export const generateAISummary = async (reportData: any): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-report-summary', {
      body: { reportData }
    });
    
    if (error) throw error;
    return data.summary || 'No summary available';
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return 'Unable to generate summary at this time.';
  }
};

export const fetchReportData = async (userId: string, startDate: Date, endDate: Date, dataTypes: string[], includeSummary: boolean) => {
  const reportData: any = {
    period: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
  
  if (dataTypes.includes('all') || dataTypes.includes('cycle')) {
    reportData.cycleData = await fetchCycleData(userId, startDate, endDate);
  }
  
  if (dataTypes.includes('all') || dataTypes.includes('symptoms')) {
    reportData.symptomsData = await fetchSymptomsData(userId, startDate, endDate);
  }
  
  if (dataTypes.includes('all') || dataTypes.includes('mood')) {
    reportData.moodData = await fetchMoodData(userId, startDate, endDate);
  }
  
  if (dataTypes.includes('all') || dataTypes.includes('medications')) {
    reportData.medicationsData = await fetchActiveMedications();
    reportData.medicationHistoryData = await fetchMedicationHistoryData(userId, startDate, endDate);
  }
  
  if (includeSummary) {
    reportData.summary = await generateAISummary(reportData);
  }
  
  return reportData;
};
