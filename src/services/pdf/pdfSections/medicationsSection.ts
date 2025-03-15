
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
  
  // Always start a new page for major sections
  doc.addPage();
  currentPage++;
  yPosition = 25;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Medications', 14, yPosition);
  yPosition += 15;
  
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
  
  yPosition = (doc as any).lastAutoTable.finalY + 20;
  
  if (medicationHistoryData && medicationHistoryData.length > 0) {
    // Always create a new page for medication history
    doc.addPage();
    currentPage++;
    yPosition = 25;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Medication History (Last 15 Entries)', 14, yPosition);
    yPosition += 15;
    
    // Filter medication history to match selected medications
    let filteredHistory = medicationHistoryData;
    if (medicationFilter !== 'all') {
      const selectedIds = medicationFilter.split(',');
      filteredHistory = medicationHistoryData.filter(entry => 
        selectedIds.includes(entry.medication_id)
      );
    }
    
    // Limit history to last 15 entries for readability
    filteredHistory = filteredHistory.slice(0, 15);
    
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
    
    yPosition = (doc as any).lastAutoTable.finalY + 20;
    
    if (includeCharts) {
      // Always create a new page for charts
      doc.addPage();
      currentPage++;
      yPosition = 25;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Medication Adherence', 14, yPosition);
      yPosition += 15;
      
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
        const imgWidth = 160;
        const imgHeight = 100; // Increased height for better visibility
        const centerX = (pageWidth - imgWidth) / 2;
        
        doc.addImage(chartImgData, 'PNG', centerX, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 25;
      } catch (error) {
        console.error('Error generating medication chart:', error);
        doc.setTextColor(255, 0, 0);
        doc.setFontSize(10);
        doc.text('Chart generation failed. Please try again.', pageWidth / 2, yPosition + 20, { align: 'center' });
        yPosition += 30;
      }
    }
  }
  
  return { yPosition, currentPage };
};
