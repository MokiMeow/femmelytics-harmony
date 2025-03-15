
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { addHeaderFooter } from './pdfHeaderFooter';

export const addTitlePage = (
  doc: jsPDF, 
  startDate: Date, 
  endDate: Date, 
  reportData: any
): void => {
  const pageWidth = doc.internal.pageSize.width;
  
  // Add header and footer
  addHeaderFooter(doc, 1);
  
  // Title page content
  doc.setFontSize(24);
  doc.text('Health Report', 105, 50, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(`Date Range: ${format(startDate, 'MMMM d, yyyy')} - ${format(endDate, 'MMMM d, yyyy')}`, 105, 65, { align: 'center' });
  
  // Add a visual divider
  doc.setDrawColor(100, 45, 161);
  doc.setLineWidth(0.5);
  doc.line(40, 75, 170, 75);
  
  // Add a subtitle about the report content
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.text('This report contains your health tracking data for the selected period.', 105, 85, { align: 'center' });
  doc.text('Use it to monitor patterns and share insights with healthcare providers.', 105, 92, { align: 'center' });
  
  let yPosition = 110;
  
  // Add table of contents
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Report Contents:', 20, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  let contentIndex = 1;
  
  if (reportData.cycleData && reportData.cycleData.length > 0) {
    doc.text(`${contentIndex}. Menstrual Cycle Data`, 25, yPosition);
    yPosition += 8;
    contentIndex++;
  }
  
  if (reportData.symptomsData && reportData.symptomsData.length > 0) {
    doc.text(`${contentIndex}. Symptoms Data`, 25, yPosition);
    yPosition += 8;
    contentIndex++;
  }
  
  if (reportData.moodData && reportData.moodData.length > 0) {
    doc.text(`${contentIndex}. Mood & Energy Data`, 25, yPosition);
    yPosition += 8;
    contentIndex++;
  }
  
  if (reportData.medicationsData && reportData.medicationsData.length > 0) {
    doc.text(`${contentIndex}. Medications Data`, 25, yPosition);
    yPosition += 8;
    contentIndex++;
  }
  
  if (reportData.summary) {
    doc.text(`${contentIndex}. Health Summary (AI Generated)`, 25, yPosition);
    yPosition += 8;
  }
};
