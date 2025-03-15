
import { supabase } from '@/integrations/supabase/client';

export type FeedbackType = 'bug' | 'feature_request' | 'general';
export type FeedbackStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

export interface Feedback {
  id?: string;
  user_id?: string;
  feedback_type: FeedbackType;
  title: string;
  description: string;
  status?: FeedbackStatus;
  created_at?: string;
  updated_at?: string;
}

export const submitFeedback = async (
  feedback_type: FeedbackType,
  title: string,
  description: string
): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    const userId = userData.user?.id;
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: userId,
        feedback_type,
        title,
        description,
        status: 'new'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

export const getUserFeedback = async (): Promise<{ success: boolean; data?: Feedback[]; error?: string }> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    const userId = userData.user?.id;
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { success: true, data: data as Feedback[] };
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};
