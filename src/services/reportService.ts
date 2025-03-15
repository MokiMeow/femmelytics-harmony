
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ExportDataType, ExportPeriod, ExportOptions } from './reportTypes';
import { fetchReportData } from './reportDataService';
import { createPDFReport } from './reportPdfService';

export type { ExportDataType, ExportPeriod, ExportOptions };

export const generateReport = async (options: ExportOptions): Promise<Blob> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - options.period);
  
  // Fetch all the required data
  const reportData = await fetchReportData(
    userId, 
    startDate, 
    endDate, 
    options.dataTypes, 
    options.includeSummary
  );
  
  // Generate the PDF report
  const pdfBlob = await createPDFReport(reportData, options.includeCharts);
  return pdfBlob;
};

// Re-export calendar integration functions
export { syncWithGoogleCalendar } from './calendarService';
