import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchActiveMedications } from './medicationService';

export type ExportDataType = 'cycle' | 'symptoms' | 'mood' | 'medications' | 'all';
export type ExportPeriod = 7 | 30 | 90 | 180 | 365;

interface ExportOptions {
  dataTypes: ExportDataType[];
  period: ExportPeriod;
  includeCharts: boolean;
  includeSummary: boolean;
}

export const generateReport = async (options: ExportOptions): Promise<Blob> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - options.period);
  
  // Collect all requested data
  const reportData: any = {
    period: options.period,
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
  
  if (options.dataTypes.includes('all') || options.dataTypes.includes('cycle')) {
    reportData.cycleData = await fetchCycleData(userId, startDate, endDate);
  }
  
  if (options.dataTypes.includes('all') || options.dataTypes.includes('symptoms')) {
    reportData.symptomsData = await fetchSymptomsData(userId, startDate, endDate);
  }
  
  if (options.dataTypes.includes('all') || options.dataTypes.includes('mood')) {
    reportData.moodData = await fetchMoodData(userId, startDate, endDate);
  }
  
  if (options.dataTypes.includes('all') || options.dataTypes.includes('medications')) {
    reportData.medicationsData = await fetchActiveMedications();
  }
  
  // Generate AI summary if requested
  if (options.includeSummary) {
    reportData.summary = await generateAISummary(reportData);
  }
  
  // Create PDF report
  const pdfBlob = await createPDFReport(reportData, options.includeCharts);
  return pdfBlob;
};

const fetchCycleData = async (userId: string, startDate: Date, endDate: Date) => {
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

const fetchSymptomsData = async (userId: string, startDate: Date, endDate: Date) => {
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

const fetchMoodData = async (userId: string, startDate: Date, endDate: Date) => {
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

const generateAISummary = async (reportData: any): Promise<string> => {
  try {
    // Call our Edge Function to generate the summary with OpenAI
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

const createPDFReport = async (reportData: any, includeCharts: boolean): Promise<Blob> => {
  const doc = new jsPDF();
  
  // Add title and date
  doc.setFontSize(20);
  doc.text('Health Report', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Date Range: ${format(new Date(reportData.startDate), 'MMM d, yyyy')} - ${format(new Date(reportData.endDate), 'MMM d, yyyy')}`, 105, 25, { align: 'center' });
  
  let yPosition = 35;
  
  // Add cycle data if available
  if (reportData.cycleData && reportData.cycleData.length > 0) {
    doc.setFontSize(16);
    doc.text('Menstrual Cycle Data', 14, yPosition);
    yPosition += 10;
    
    const cycleTableData = reportData.cycleData.map((entry: any) => [
      format(new Date(entry.date), 'MMM d, yyyy'),
      entry.cycle_phase || 'Not specified',
      entry.flow_intensity,
      entry.notes || '-'
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Phase', 'Flow', 'Notes']],
      body: cycleTableData,
      startY: yPosition
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Add symptom data if available
  if (reportData.symptomsData && reportData.symptomsData.length > 0) {
    // Check if we need a new page
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Symptoms Data', 14, yPosition);
    yPosition += 10;
    
    const symptomsTableData = reportData.symptomsData.map((entry: any) => [
      format(new Date(entry.date), 'MMM d, yyyy'),
      entry.symptom_type,
      entry.severity || '-'
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Symptom', 'Severity (1-5)']],
      body: symptomsTableData,
      startY: yPosition
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Add mood data if available
  if (reportData.moodData && reportData.moodData.length > 0) {
    // Check if we need a new page
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Mood & Energy Data', 14, yPosition);
    yPosition += 10;
    
    const moodTableData = reportData.moodData.map((entry: any) => [
      format(new Date(entry.date), 'MMM d, yyyy'),
      entry.mood_score || '-',
      entry.energy_score || '-',
      entry.notes || '-'
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Mood (1-5)', 'Energy (1-5)', 'Notes']],
      body: moodTableData,
      startY: yPosition
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Add medications data if available
  if (reportData.medicationsData && reportData.medicationsData.length > 0) {
    // Check if we need a new page
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Medications', 14, yPosition);
    yPosition += 10;
    
    const medicationsTableData = reportData.medicationsData.map((entry: any) => [
      entry.name,
      entry.dosage,
      entry.frequency,
      entry.time_of_day,
      format(new Date(entry.start_date), 'MMM d, yyyy'),
      entry.end_date ? format(new Date(entry.end_date), 'MMM d, yyyy') : 'Ongoing',
      entry.notes || '-'
    ]);
    
    autoTable(doc, {
      head: [['Name', 'Dosage', 'Frequency', 'Time', 'Start Date', 'End Date', 'Notes']],
      body: medicationsTableData,
      startY: yPosition,
      styles: { cellWidth: 'auto' },
      columnStyles: { 6: { cellWidth: 40 } }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Add AI summary if available
  if (reportData.summary) {
    doc.addPage();
    
    doc.setFontSize(16);
    doc.text('Health Summary (AI Generated)', 14, 20);
    
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(reportData.summary, 180);
    doc.text(splitText, 14, 35);
  }
  
  // Convert to blob and return
  return doc.output('blob');
};

// Sync cycle data with Google Calendar
export const syncWithGoogleCalendar = async (calendarId: string, accessToken: string): Promise<boolean> => {
  try {
    // Get the user's next predicted cycle start date
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    const userId = userData.user?.id;
    if (!userId) throw new Error('User not authenticated');
    
    const { data: cycleData, error: cycleError } = await supabase
      .from('cycle_statistics')
      .select('next_predicted_date, average_period_length, average_cycle_length')
      .eq('user_id', userId)
      .single();
      
    if (cycleError) throw cycleError;
    if (!cycleData?.next_predicted_date) return false;
    
    // Create Google Calendar event
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: 'Period Start Date',
        description: 'Predicted start of your next menstrual cycle',
        start: {
          date: cycleData.next_predicted_date
        },
        end: {
          date: format(new Date(new Date(cycleData.next_predicted_date).getTime() + 
            (cycleData.average_period_length || 5) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
        },
        colorId: '11', // Red color
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 24 * 60 }] // 1 day before
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create calendar event: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    return false;
  }
};
