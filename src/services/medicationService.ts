
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface Medication {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  time_of_day: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  active?: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MedicationHistory {
  id?: string;
  medication_id: string;
  taken: boolean;
  taken_at?: string;
  notes?: string;
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
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('id', id)
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
  const { data, error } = await supabase
    .from('medications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Delete a medication
export const deleteMedication = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id);
    
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
  const { data, error } = await supabase
    .from('medication_history')
    .select('*')
    .eq('medication_id', medicationId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

// Calculate medication adherence (percentage of times taken)
export const calculateAdherence = async (medicationId: string, days: number = 30): Promise<number> => {
  const medication = await fetchMedication(medicationId);
  if (!medication) return 0;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get history for the last X days
  const { data, error } = await supabase
    .from('medication_history')
    .select('*')
    .eq('medication_id', medicationId)
    .gte('created_at', startDate.toISOString());
    
  if (error) throw error;
  
  // Count expected doses based on frequency
  let expectedDoses = 0;
  
  if (medication.frequency === 'Daily') {
    expectedDoses = days;
  } else if (medication.frequency === 'Twice daily') {
    expectedDoses = days * 2;
  } else if (medication.frequency === 'Weekly') {
    expectedDoses = Math.ceil(days / 7);
  } else {
    // Default for other frequencies
    expectedDoses = days;
  }
  
  const actualDoses = data?.filter(record => record.taken).length || 0;
  
  if (expectedDoses === 0) return 0;
  return Math.round((actualDoses / expectedDoses) * 100);
};
