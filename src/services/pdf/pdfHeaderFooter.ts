
import jsPDF from 'jspdf';
import { format } from 'date-fns';

export const addHeaderFooter = (doc: jsPDF, pageNumber: number): void => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Add header with app name and border
  doc.setFillColor(100, 45, 161); // Primary color
  doc.rect(0, 0, pageWidth, pageNumber === 1 ? 20 : 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  
  if (pageNumber === 1) {
    // Title page has larger header
    doc.setFontSize(16);
    doc.text('Femmelytics Health Report', pageWidth / 2, 12, { align: 'center' });
  } else {
    // Content pages have smaller header
    doc.setFontSize(12);
    doc.text('Femmelytics Health Report', pageWidth / 2, 10, { align: 'center' });
  }
  
  // Add footer with date and page number
  doc.setDrawColor(200, 200, 200);
  doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 10);
  
  // Reset text color for body content
  doc.setTextColor(0, 0, 0);
};

export const checkPageBreak = (doc: jsPDF, currentPage: number, minRemainingSpace: number): { newY: number, currentPage: number } => {
  const pageHeight = doc.internal.pageSize.height;
  // Get current Y position from last table or fallback to a default
  const currentY = (doc as any).lastAutoTable?.finalY || 25;
  
  if (currentY > pageHeight - minRemainingSpace) {
    doc.addPage();
    currentPage++;
    addHeaderFooter(doc, currentPage);
    return { newY: 25, currentPage };
  }
  
  return { newY: currentY, currentPage };
};
