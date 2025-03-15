
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { generateChartAsBase64 } from '../../reportChartRenderer';
import { prepareCyclePhaseChartData } from '../../reportChartService';
import { checkPageBreak } from '../pdfHeaderFooter';

export const addCycleSection = async (
  doc: jsPDF, 
  cycleData: any[], 
  includeCharts: boolean,
  yPosition: number,
  currentPage: number
): Promise<{ yPosition: number, currentPage: number }> => {
  if (!cycleData || cycleData.length === 0) {
    return { yPosition, currentPage };
  }
  
  // Always start a new page for major sections
  doc.addPage();
  currentPage++;
  yPosition = 25;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Menstrual Cycle Data', 14, yPosition);
  yPosition += 15;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  const cycleTableData = cycleData.map((entry: any) => [
    format(new Date(entry.date), 'MMM d, yyyy'),
    entry.cycle_phase || 'Not specified',
    entry.flow_intensity,
    entry.notes || '-'
  ]);
  
  autoTable(doc, {
    head: [['Date', 'Phase', 'Flow', 'Notes']],
    body: cycleTableData,
    startY: yPosition,
    headStyles: {
      fillColor: [180, 120, 220],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 255],
    },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 20;
  
  if (includeCharts) {
    // Check if we need a page break for the chart
    const result = checkPageBreak(doc, currentPage, 120);
    yPosition = result.newY;
    currentPage = result.currentPage;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Cycle Phase Distribution', 14, yPosition);
    yPosition += 15;
    
    const cycleChartData = prepareCyclePhaseChartData(cycleData);
    
    try {
      const chartImgData = await generateChartAsBase64(
        'cycle-chart', 
        cycleChartData, 
        'pie', 
        'Cycle Phase Distribution'
      );
      
      // Add the image at a higher quality and better size ratio
      const pageWidth = doc.internal.pageSize.width;
      const imgWidth = 150;
      const imgHeight = 80;
      doc.addImage(chartImgData, 'PNG', (pageWidth - imgWidth) / 2, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 25;
    } catch (error) {
      console.error('Error generating cycle chart:', error);
      yPosition += 10;
    }
  }
  
  return { yPosition, currentPage };
};
