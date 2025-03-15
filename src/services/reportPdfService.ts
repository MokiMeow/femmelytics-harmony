import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { 
  prepareSymptomChartData, 
  prepareMoodChartData,
  prepareCyclePhaseChartData,
  prepareMedicationAdherenceChartData
} from './reportChartService';
import { generateChartAsBase64 } from './reportChartRenderer';

export const createPDFReport = async (reportData: any, includeCharts: boolean): Promise<Blob> => {
  // Create PDF with better formatting and organization
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Add custom header/footer if desired
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Add header with app name and border
  doc.setFillColor(100, 45, 161); // Primary color
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Femmelytics Health Report', pageWidth / 2, 12, { align: 'center' });
  
  // Add footer with date
  doc.setDrawColor(200, 200, 200);
  doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text(`Page ${1}`, pageWidth - 20, pageHeight - 10);
  
  // Reset text color for body
  doc.setTextColor(0, 0, 0);
  
  // Title page content
  doc.setFontSize(24);
  doc.text('Health Report', 105, 50, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(`Date Range: ${format(new Date(reportData.startDate), 'MMMM d, yyyy')} - ${format(new Date(reportData.endDate), 'MMMM d, yyyy')}`, 105, 65, { align: 'center' });
  
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
  
  // Start new page for report content
  doc.addPage();
  
  let currentPage = 2;
  // Add header and footer to all pages
  const addHeaderFooter = (pageNumber: number) => {
    doc.setFillColor(100, 45, 161); // Primary color
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Femmelytics Health Report', pageWidth / 2, 10, { align: 'center' });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 10);
    
    // Reset text color for body
    doc.setTextColor(0, 0, 0);
  };
  
  addHeaderFooter(currentPage);
  
  // Function to handle page breaks and header/footer - Fixed to use proper y position tracking
  const checkPageBreak = (minRemainingSpace: number) => {
    // Correctly get current Y position using lastAutoTable or direct Y tracking
    const currentY = (doc as any).lastAutoTable?.finalY || doc.previousAutoTable?.finalY || 25;
    if (currentY > pageHeight - minRemainingSpace) {
      doc.addPage();
      currentPage++;
      addHeaderFooter(currentPage);
      return 25; // New Y position after page break
    }
    return currentY;
  };
  
  yPosition = 25;
  
  if (reportData.cycleData && reportData.cycleData.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Menstrual Cycle Data', 14, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    const cycleTableData = reportData.cycleData.map((entry: any) => [
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
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    if (includeCharts) {
      yPosition = checkPageBreak(120);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Cycle Phase Distribution', 14, yPosition);
      yPosition += 10;
      
      const cycleChartData = prepareCyclePhaseChartData(reportData.cycleData);
      
      try {
        const chartImgData = await generateChartAsBase64(
          'cycle-chart', 
          cycleChartData, 
          'pie', 
          'Cycle Phase Distribution'
        );
        
        // Add the image at a higher quality and better size ratio
        const imgWidth = 170;
        const imgHeight = 90;
        doc.addImage(chartImgData, 'PNG', (pageWidth - imgWidth) / 2, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 20;
      } catch (error) {
        console.error('Error generating cycle chart:', error);
        yPosition += 10;
      }
    }
  }
  
  if (reportData.symptomsData && reportData.symptomsData.length > 0) {
    yPosition = checkPageBreak(50);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Symptoms Data', 14, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    const symptomsTableData = reportData.symptomsData.map((entry: any) => [
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
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    if (includeCharts && reportData.symptomsData.length > 0) {
      yPosition = checkPageBreak(120);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Symptom Frequency', 14, yPosition);
      yPosition += 10;
      
      const symptomChartData = prepareSymptomChartData(reportData.symptomsData);
      
      try {
        const chartImgData = await generateChartAsBase64(
          'symptom-chart', 
          symptomChartData, 
          'pie', 
          'Symptom Frequency'
        );
        
        const imgWidth = 170;
        const imgHeight = 90;
        doc.addImage(chartImgData, 'PNG', (pageWidth - imgWidth) / 2, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 20;
      } catch (error) {
        console.error('Error generating symptom chart:', error);
        yPosition += 10;
      }
    }
  }
  
  if (reportData.moodData && reportData.moodData.length > 0) {
    yPosition = checkPageBreak(50);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Mood & Energy Data', 14, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    const moodTableData = reportData.moodData.map((entry: any) => [
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
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    if (includeCharts && reportData.moodData.length > 0) {
      yPosition = checkPageBreak(120);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Mood & Energy Trends', 14, yPosition);
      yPosition += 10;
      
      const moodChartData = prepareMoodChartData(reportData.moodData);
      
      try {
        const chartImgData = await generateChartAsBase64(
          'mood-chart', 
          moodChartData, 
          'line', 
          'Mood & Energy Trends'
        );
        
        const imgWidth = 170;
        const imgHeight = 90;
        doc.addImage(chartImgData, 'PNG', (pageWidth - imgWidth) / 2, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 20;
      } catch (error) {
        console.error('Error generating mood chart:', error);
        yPosition += 10;
      }
    }
  }
  
  if (reportData.medicationsData && reportData.medicationsData.length > 0) {
    yPosition = checkPageBreak(50);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Medications', 14, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    const medicationsTableData = reportData.medicationsData.map((entry: any) => [
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
      columnStyles: {
        0: { cellWidth: 25 },
        6: { cellWidth: 30 }
      },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    if (reportData.medicationHistoryData && reportData.medicationHistoryData.length > 0) {
      yPosition = checkPageBreak(150);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Medication History', 14, yPosition);
      yPosition += 10;
      
      const medicationHistoryTableData = reportData.medicationHistoryData.map((entry: any) => {
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
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [245, 245, 255],
        },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
      
      if (includeCharts) {
        yPosition = checkPageBreak(120);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Medication Adherence', 14, yPosition);
        yPosition += 10;
        
        try {
          const medicationAdherenceData = prepareMedicationAdherenceChartData(
            reportData.medicationsData, 
            reportData.medicationHistoryData
          );
          
          const chartImgData = await generateChartAsBase64(
            'medication-chart',
            medicationAdherenceData,
            'bar',
            'Medication Adherence (%)'
          );
          
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
  }
  
  if (reportData.summary) {
    yPosition = checkPageBreak(100);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Health Summary (AI Generated)', 14, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    const textMargin = 14;
    const maxWidth = pageWidth - (textMargin * 2);
    
    const splitText = (doc as any).splitTextToSize(reportData.summary, maxWidth);
    doc.text(splitText, textMargin, yPosition);
    
    // Disclaimer about AI-generated content
    yPosition += splitText.length * 6 + 10;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Note: This summary was generated by an AI system and should not replace professional medical advice.', textMargin, yPosition);
    doc.text('Always consult with healthcare providers regarding health concerns and treatment decisions.', textMargin, yPosition + 5);
  }
  
  // Return the PDF as a blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};
