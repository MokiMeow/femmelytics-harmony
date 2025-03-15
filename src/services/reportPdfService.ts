
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { addHeaderFooter } from './pdf/pdfHeaderFooter';
import { addTitlePage } from './pdf/titlePageGenerator';
import { addCycleSection } from './pdf/pdfSections/cycleSection';
import { addSymptomsSection } from './pdf/pdfSections/symptomsSection';
import { addMoodSection } from './pdf/pdfSections/moodSection';
import { addMedicationsSection } from './pdf/pdfSections/medicationsSection';
import { addSummarySection } from './pdf/pdfSections/summarySection';

export const createPDFReport = async (reportData: any, includeCharts: boolean): Promise<Blob> => {
  // Create PDF with better formatting and organization
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Add title page
  const startDate = new Date(reportData.startDate);
  const endDate = new Date(reportData.endDate);
  addTitlePage(doc, startDate, endDate, reportData);
  
  // Start new page for report content
  doc.addPage();
  
  let currentPage = 2;
  addHeaderFooter(doc, currentPage);
  
  let yPosition = 25;
  
  // Track if we need to add a page break
  const needsPageBreak = (requiredSpace: number): boolean => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const currentY = (doc as any).lastAutoTable?.finalY || yPosition;
    return currentY + requiredSpace > pageHeight - 25;
  };
  
  // Function to add a new page
  const addNewPage = (): void => {
    doc.addPage();
    currentPage++;
    addHeaderFooter(doc, currentPage);
    yPosition = 25;
  };
  
  // Add cycle data section if available
  if (reportData.cycleData && reportData.cycleData.length > 0) {
    if (needsPageBreak(40)) addNewPage();
    
    const result = await addCycleSection(doc, reportData.cycleData, includeCharts, yPosition, currentPage);
    yPosition = result.yPosition;
    currentPage = result.currentPage;
  }
  
  // Add symptoms data section if available
  if (reportData.symptomsData && reportData.symptomsData.length > 0) {
    if (needsPageBreak(40)) addNewPage();
    
    const result = await addSymptomsSection(doc, reportData.symptomsData, includeCharts, yPosition, currentPage);
    yPosition = result.yPosition;
    currentPage = result.currentPage;
  }
  
  // Add mood data section if available
  if (reportData.moodData && reportData.moodData.length > 0) {
    if (needsPageBreak(40)) addNewPage();
    
    const result = await addMoodSection(doc, reportData.moodData, includeCharts, yPosition, currentPage);
    yPosition = result.yPosition;
    currentPage = result.currentPage;
  }
  
  // Add medications data section if available
  if (reportData.medicationsData && reportData.medicationsData.length > 0) {
    if (needsPageBreak(40)) addNewPage();
    
    const result = await addMedicationsSection(
      doc,
      reportData.medicationsData,
      reportData.medicationHistoryData || [],
      includeCharts,
      yPosition,
      currentPage,
      reportData.medicationFilter || 'all'
    );
    yPosition = result.yPosition;
    currentPage = result.currentPage;
  }
  
  // Add AI-generated summary if available
  if (reportData.summary) {
    if (needsPageBreak(40)) addNewPage();
    
    const result = addSummarySection(doc, reportData.summary, yPosition, currentPage);
    yPosition = result.yPosition;
    currentPage = result.currentPage;
  }
  
  // Return the PDF as a blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};
