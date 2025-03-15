
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
  
  // Handle date range calculation
  let startDate: Date;
  let endDate: Date = options.endDate || new Date();
  
  if (options.period === 'custom' && options.startDate) {
    startDate = options.startDate;
  } else {
    startDate = new Date();
    // Only subtract days if period is a number (not 'custom')
    if (typeof options.period === 'number') {
      startDate.setDate(endDate.getDate() - options.period);
    } else {
      // Default to 30 days if custom period selected without startDate
      startDate.setDate(endDate.getDate() - 30);
    }
  }
  
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
