
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { generateChartAsBase64 } from '../../reportChartRenderer';
import { prepareMoodChartData } from '../../reportChartService';
import { checkPageBreak } from '../pdfHeaderFooter';

export const addMoodSection = async (
  doc: jsPDF, 
  moodData: any[], 
  includeCharts: boolean,
  yPosition: number,
  currentPage: number
): Promise<{ yPosition: number, currentPage: number }> => {
  if (!moodData || moodData.length === 0) {
    return { yPosition, currentPage };
  }
  
  // Always start a new page for major sections
  doc.addPage();
  currentPage++;
  yPosition = 25;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Mood & Energy Data', 14, yPosition);
  yPosition += 15;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  const moodTableData = moodData.map((entry: any) => [
    format(new Date(entry.date), 'MMM d, yyyy'),
    entry.mood_score ? `${entry.mood_score}/5` : '-',
    entry.energy_score ? `${entry.energy_score}/5` : '-',
    entry.notes || '-'
  ]);
  
  autoTable(doc, {
    head: [['Date', 'Mood', 'Energy', 'Notes']],
    body: moodTableData,
    startY: yPosition,
    headStyles: {
      fillColor: [255, 99, 132],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [255, 240, 245],
    },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 20;
  
  if (includeCharts && moodData.length > 0) {
    // Check if we need a page break for the chart
    const chartPageBreakResult = checkPageBreak(doc, currentPage, 120);
    yPosition = chartPageBreakResult.newY;
    currentPage = chartPageBreakResult.currentPage;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Mood & Energy Trends', 14, yPosition);
    yPosition += 15;
    
    const moodChartData = prepareMoodChartData(moodData);
    
    try {
      const chartImgData = await generateChartAsBase64(
        'mood-chart', 
        moodChartData, 
        'line', 
        'Mood & Energy Trends'
      );
      
      const pageWidth = doc.internal.pageSize.width;
      const imgWidth = 150;
      const imgHeight = 80;
      doc.addImage(chartImgData, 'PNG', (pageWidth - imgWidth) / 2, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 25;
    } catch (error) {
      console.error('Error generating mood chart:', error);
      yPosition += 10;
    }
  }
  
  return { yPosition, currentPage };
};
