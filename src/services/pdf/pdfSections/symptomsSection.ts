
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { generateChartAsBase64 } from '../../reportChartRenderer';
import { prepareSymptomChartData } from '../../reportChartService';
import { checkPageBreak } from '../pdfHeaderFooter';

export const addSymptomsSection = async (
  doc: jsPDF, 
  symptomsData: any[], 
  includeCharts: boolean,
  yPosition: number,
  currentPage: number
): Promise<{ yPosition: number, currentPage: number }> => {
  if (!symptomsData || symptomsData.length === 0) {
    return { yPosition, currentPage };
  }
  
  // Always start a new page for major sections
  doc.addPage();
  currentPage++;
  yPosition = 25;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Symptoms Data', 14, yPosition);
  yPosition += 15;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  const symptomsTableData = symptomsData.map((entry: any) => [
    format(new Date(entry.date), 'MMM d, yyyy'),
    entry.symptom_type,
    entry.severity ? `${entry.severity}/5` : '-'
  ]);
  
  autoTable(doc, {
    head: [['Date', 'Symptom', 'Severity']],
    body: symptomsTableData,
    startY: yPosition,
    headStyles: {
      fillColor: [75, 192, 192],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 250, 250],
    },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 20;
  
  if (includeCharts && symptomsData.length > 0) {
    // Check if we need a page break for the chart
    const chartPageBreakResult = checkPageBreak(doc, currentPage, 120);
    yPosition = chartPageBreakResult.newY;
    currentPage = chartPageBreakResult.currentPage;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Symptom Frequency', 14, yPosition);
    yPosition += 15;
    
    const symptomChartData = prepareSymptomChartData(symptomsData);
    
    try {
      const chartImgData = await generateChartAsBase64(
        'symptom-chart', 
        symptomChartData, 
        'pie', 
        'Symptom Frequency'
      );
      
      const pageWidth = doc.internal.pageSize.width;
      const imgWidth = 150;
      const imgHeight = 80;
      doc.addImage(chartImgData, 'PNG', (pageWidth - imgWidth) / 2, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 25;
    } catch (error) {
      console.error('Error generating symptom chart:', error);
      yPosition += 10;
    }
  }
  
  return { yPosition, currentPage };
};
