
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface JournalEntry {
  id?: string;
  title: string;
  content: string;
  date: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Fetch all journal entries for the current user
export const fetchJournalEntries = async (): Promise<JournalEntry[]> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

// Fetch a single journal entry by ID
export const fetchJournalEntry = async (id: string): Promise<JournalEntry | null> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

// Create a new journal entry
export const createJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<JournalEntry> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('journal_entries')
    .insert([{ ...entry, user_id: userId }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Update an existing journal entry
export const updateJournalEntry = async (id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Delete a journal entry
export const deleteJournalEntry = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};
