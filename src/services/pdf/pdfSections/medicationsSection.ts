
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { generateChartAsBase64 } from '../../reportChartRenderer';
import { prepareMedicationAdherenceChartData } from '../../reportChartService';
import { checkPageBreak } from '../pdfHeaderFooter';

export const addMedicationsSection = async (
  doc: jsPDF, 
  medicationsData: any[],
  medicationHistoryData: any[],
  includeCharts: boolean,
  yPosition: number,
  currentPage: number,
  medicationFilter: string = 'all'
): Promise<{ yPosition: number, currentPage: number }> => {
  if (!medicationsData || medicationsData.length === 0) {
    return { yPosition, currentPage };
  }
  
  // Check if we need a page break before starting medications section
  const pageBreakResult = checkPageBreak(doc, currentPage, 50);
  yPosition = pageBreakResult.newY;
  currentPage = pageBreakResult.currentPage;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Medications', 14, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  // Filter medications if needed
  let filteredMedications = medicationsData;
  if (medicationFilter !== 'all') {
    // If there are specific medications selected, filter by their IDs
    const selectedIds = medicationFilter.split(',');
    filteredMedications = medicationsData.filter(med => selectedIds.includes(med.id));
  }
  
  const medicationsTableData = filteredMedications.map((entry: any) => [
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
    headStyles: {
      fillColor: [100, 100, 220],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 240, 255],
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 25 },
      6: { cellWidth: 30 }
    },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  if (medicationHistoryData && medicationHistoryData.length > 0) {
    // Filter medication history to match selected medications
    let filteredHistory = medicationHistoryData;
    if (medicationFilter !== 'all') {
      const selectedIds = medicationFilter.split(',');
      filteredHistory = medicationHistoryData.filter(entry => 
        selectedIds.includes(entry.medication_id)
      );
    }
    
    // Limit history to last 30 entries for readability
    filteredHistory = filteredHistory.slice(0, 30);
    
    // Check for page break before medication history
    const historyPageBreakResult = checkPageBreak(doc, currentPage, 130);
    yPosition = historyPageBreakResult.newY;
    currentPage = historyPageBreakResult.currentPage;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Medication History (Last 30 Entries)', 14, yPosition);
    yPosition += 10;
    
    const medicationHistoryTableData = filteredHistory.map((entry: any) => {
      const medicationName = entry.medications?.name || 'Unknown';
      return [
        format(new Date(entry.taken_at), 'MMM d, yyyy h:mm a'),
        medicationName,
        entry.taken ? 'Taken' : 'Missed',
        entry.notes || '-'
      ];
    });
    
    autoTable(doc, {
      head: [['Date & Time', 'Medication', 'Status', 'Notes']],
      body: medicationHistoryTableData,
      startY: yPosition,
      headStyles: {
        fillColor: [100, 150, 220],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      alternateRowStyles: {
        fillColor: [245, 245, 255],
      },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    if (includeCharts) {
      // Check for page break before adherence chart
      const chartPageBreakResult = checkPageBreak(doc, currentPage, 120);
      yPosition = chartPageBreakResult.newY;
      currentPage = chartPageBreakResult.currentPage;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Medication Adherence', 14, yPosition);
      yPosition += 10;
      
      try {
        const medicationAdherenceData = prepareMedicationAdherenceChartData(
          filteredMedications, 
          filteredHistory
        );
        
        const chartImgData = await generateChartAsBase64(
          'medication-chart',
          medicationAdherenceData,
          'bar',
          'Medication Adherence (%)'
        );
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const imgWidth = 170;
        const imgHeight = 90;
        doc.addImage(chartImgData, 'PNG', (pageWidth - imgWidth) / 2, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 20;
      } catch (error) {
        console.error('Error generating medication chart:', error);
        yPosition += 10;
      }
    }
  }
  
  return { yPosition, currentPage };
};
