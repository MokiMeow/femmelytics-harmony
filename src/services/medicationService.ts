
import { supabase } from '@/integrations/supabase/client';
import { requireUserId } from './requireUser';
import { adherencePercentage, expectedDosesForFrequency } from './medicationAdherence';

export interface Medication {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  time_of_day: string;
  start_date: string;
  end_date?: string | null;
  notes?: string | null;
  active?: boolean | null;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MedicationHistory {
  id?: string;
  medication_id: string;
  taken: boolean;
  taken_at?: string | null;
  notes?: string | null;
  user_id?: string;
  created_at?: string;
}

// Fetch all medications for the current user
export const fetchMedications = async (): Promise<Medication[]> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', userId)
    .order('name');
    
  if (error) throw error;
  return data || [];
};

// Fetch active medications for the current user
export const fetchActiveMedications = async (): Promise<Medication[]> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('name');
    
  if (error) throw error;
  return data || [];
};

// Fetch a single medication by ID
export const fetchMedication = async (id: string): Promise<Medication | null> => {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

// Create a new medication
export const createMedication = async (medication: Omit<Medication, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Medication> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('medications')
    .insert([{ ...medication, user_id: userId, active: true }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Update an existing medication
export const updateMedication = async (id: string, updates: Partial<Medication>): Promise<Medication> => {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('medications')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Delete a medication
export const deleteMedication = async (id: string): Promise<void> => {
  const userId = await requireUserId();
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
    
  if (error) throw error;
};

// Mark medication as taken
export const markMedicationAsTaken = async (medicationId: string, notes?: string): Promise<MedicationHistory> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('medication_history')
    .insert([{ 
      medication_id: medicationId, 
      user_id: userId,
      taken: true,
      taken_at: new Date().toISOString(),
      notes
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Get medication history for a specific medication
export const getMedicationHistory = async (medicationId: string): Promise<MedicationHistory[]> => {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('medication_history')
    .select('*')
    .eq('medication_id', medicationId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

// Calculate medication adherence (percentage of times taken)
export const calculateAdherence = async (medicationId: string, days: number = 30): Promise<number> => {
  const userId = await requireUserId();
  const medication = await fetchMedication(medicationId);
  if (!medication) return 0;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get history for the last X days
  const { data, error } = await supabase
    .from('medication_history')
    .select('*')
    .eq('medication_id', medicationId)
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());
    
  if (error) throw error;
  
  const actualDoses = data?.filter(record => record.taken).length || 0;
  const expectedDoses = expectedDosesForFrequency(medication.frequency, days);
  return adherencePercentage(actualDoses, expectedDoses);
};
