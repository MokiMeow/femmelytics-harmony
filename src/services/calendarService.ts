
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fetchCycleData } from './reportDataService';

// Function to sync cycle data with Google Calendar
export const syncWithGoogleCalendar = async (accessToken: string): Promise<{ success: boolean }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // Get cycle data for the last 90 days and upcoming 90 days
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 90);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);
  
  const cycleData = await fetchCycleData(userId, startDate, endDate);
  
  // Format cycle data for Google Calendar
  const calendarEvents = cycleData.map((entry: any) => ({
    summary: `Cycle: ${entry.cycle_phase || 'Not specified'}`,
    description: `Flow: ${entry.flow_intensity || 'None'}\nNotes: ${entry.notes || ''}`,
    start: {
      date: entry.date,
      timeZone: 'UTC',
    },
    end: {
      date: entry.date,
      timeZone: 'UTC',
    },
    colorId: getCyclePhaseColorId(entry.cycle_phase),
  }));
  
  // Make request to backend function to sync with Google Calendar
  const { error } = await supabase.functions.invoke('sync-google-calendar', {
    body: { 
      accessToken,
      events: calendarEvents 
    }
  });
  
  if (error) throw error;
  
  return { success: true };
};

// Helper function to get Google Calendar color ID based on cycle phase
const getCyclePhaseColorId = (phase: string | null): string => {
  if (!phase) return '0'; // Default color
  
  const phaseColors: {[key: string]: string} = {
    'menstruation': '11', // Red
    'follicular': '2',   // Green
    'ovulation': '5',    // Yellow
    'luteal': '6',       // Orange
  };
  
  return phaseColors[phase.toLowerCase()] || '0';
};
