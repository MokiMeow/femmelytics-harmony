
import jsPDF from 'jspdf';
import { format } from 'date-fns';

export const addHeaderFooter = (doc: jsPDF, pageNumber: number) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Header
  doc.setFillColor(102, 51, 153); // Purple color for header
  doc.rect(0, 0, pageWidth, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Feminalytics Health Report', pageWidth / 2, 10, { align: 'center' });
  
  // Footer
  doc.setDrawColor(200, 200, 200);
  doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const today = format(new Date(), 'MMMM dd, yyyy');
  doc.text(`Generated on: ${today}`, 14, pageHeight - 10);
  
  doc.text(`Page ${pageNumber}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
};

export const checkPageBreak = (
  doc: jsPDF, 
  currentPage: number, 
  requiredSpace: number
): { newY: number, currentPage: number } => {
  const pageHeight = doc.internal.pageSize.height;
  const safeBottomMargin = 25;
  
  // Calculate current Y position
  let currentY = 25; // Default starting position
  
  // Try to get the Y position from the last auto table if available
  if ((doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY) {
    currentY = (doc as any).lastAutoTable.finalY;
  }
  
  // If we don't have enough space, add a new page
  if (currentY + requiredSpace > pageHeight - safeBottomMargin) {
    doc.addPage();
    currentPage++;
    addHeaderFooter(doc, currentPage);
    return { newY: 25, currentPage };
  }
  
  return { newY: currentY, currentPage };
};
