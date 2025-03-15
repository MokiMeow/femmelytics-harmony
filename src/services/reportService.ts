import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchActiveMedications } from './medicationService';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export type ExportDataType = 'cycle' | 'symptoms' | 'mood' | 'medications' | 'all';
export type ExportPeriod = 7 | 30 | 90 | 180 | 365;

interface ExportOptions {
  dataTypes: ExportDataType[];
  period: ExportPeriod;
  includeCharts: boolean;
  includeSummary: boolean;
}

export const generateReport = async (options: ExportOptions): Promise<Blob> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - options.period);
  
  const reportData: any = {
    period: options.period,
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
  
  if (options.dataTypes.includes('all') || options.dataTypes.includes('cycle')) {
    reportData.cycleData = await fetchCycleData(userId, startDate, endDate);
  }
  
  if (options.dataTypes.includes('all') || options.dataTypes.includes('symptoms')) {
    reportData.symptomsData = await fetchSymptomsData(userId, startDate, endDate);
  }
  
  if (options.dataTypes.includes('all') || options.dataTypes.includes('mood')) {
    reportData.moodData = await fetchMoodData(userId, startDate, endDate);
  }
  
  if (options.dataTypes.includes('all') || options.dataTypes.includes('medications')) {
    reportData.medicationsData = await fetchActiveMedications();
    reportData.medicationHistoryData = await fetchMedicationHistoryData(userId, startDate, endDate);
  }
  
  if (options.includeSummary) {
    reportData.summary = await generateAISummary(reportData);
  }
  
  const pdfBlob = await createPDFReport(reportData, options.includeCharts);
  return pdfBlob;
};

const fetchCycleData = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase
    .from('cycle_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date', { ascending: true });
    
  if (error) throw error;
  return data || [];
};

const fetchSymptomsData = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase
    .from('symptom_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date', { ascending: true });
    
  if (error) throw error;
  return data || [];
};

const fetchMoodData = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date', { ascending: true });
    
  if (error) throw error;
  return data || [];
};

const fetchMedicationHistoryData = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase
    .from('medication_history')
    .select('*, medications(name, dosage, frequency)')
    .eq('user_id', userId)
    .gte('taken_at', startDate.toISOString())
    .lte('taken_at', endDate.toISOString())
    .order('taken_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

const generateAISummary = async (reportData: any): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-report-summary', {
      body: { reportData }
    });
    
    if (error) throw error;
    return data.summary || 'No summary available';
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return 'Unable to generate summary at this time.';
  }
};

const generateChartAsBase64 = (canvasId: string, chartData: any, chartType: string, title: string): Promise<string> => {
  return new Promise((resolve) => {
    // Check if we have sufficient data to generate a chart
    const hasData = chartType === 'pie' 
      ? (chartData.labels?.length > 0 && chartData.values?.length > 0)
      : (chartData.labels?.length > 0 && chartData.datasets?.[0]?.data?.length > 0);

    if (!hasData) {
      // Create a canvas with a "No data" message instead of a chart
      const canvas = document.createElement('canvas');
      canvas.id = canvasId;
      canvas.width = 800;  // Increased for better resolution
      canvas.height = 400; // Increased for better resolution
      document.body.appendChild(canvas);
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 24px Arial'; // Increased font size
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, canvas.width / 2, 60);
        
        ctx.font = '20px Arial'; // Increased font size
        ctx.fillText('Not sufficient data to create this chart', canvas.width / 2, canvas.height / 2);
      }
      
      const imgData = canvas.toDataURL('image/png');
      document.body.removeChild(canvas);
      resolve(imgData);
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.width = 800;  // Increased for better resolution
    canvas.height = 440; // Increased for better resolution
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Set device pixel ratio for better resolution
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    let chart;
    
    if (chartType === 'line') {
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: chartData.datasets.map((dataset: any) => ({
            ...dataset,
            borderWidth: 3,  // Thicker lines
            pointRadius: 5,  // Larger points
            pointHoverRadius: 8
          })),
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: title,
              font: {
                size: 22,  // Larger title
                weight: 'bold'
              },
              padding: {
                top: 20,
                bottom: 20
              }
            },
            legend: {
              position: 'top',
              labels: {
                boxWidth: 20,  // Larger legend boxes
                padding: 20,
                font: {
                  size: 16  // Larger legend text
                }
              }
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: chartData.yAxisLabel || 'Value',
                font: {
                  size: 16,  // Larger axis title
                  weight: 'bold'
                }
              },
              ticks: {
                font: {
                  size: 14  // Larger tick labels
                },
                padding: 10
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.3)'  // Lighter grid lines
              }
            },
            x: {
              title: {
                display: true,
                text: chartData.xAxisLabel || 'Date',
                font: {
                  size: 16,  // Larger axis title
                  weight: 'bold'
                }
              },
              ticks: {
                font: {
                  size: 14  // Larger tick labels
                },
                padding: 10
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.3)'  // Lighter grid lines
              }
            }
          },
          animation: false
        }
      });
    } else if (chartType === 'pie') {
      chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: chartData.labels,
          datasets: [{
            data: chartData.values,
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(199, 199, 199, 0.8)',
              'rgba(83, 102, 255, 0.8)',
              'rgba(40, 167, 69, 0.8)',
              'rgba(220, 53, 69, 0.8)',
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: title,
              font: {
                size: 22,  // Larger title
                weight: 'bold'
              },
              padding: {
                top: 20,
                bottom: 20
              }
            },
            legend: {
              position: 'right',
              labels: {
                boxWidth: 20,  // Larger legend boxes
                padding: 15,
                font: {
                  size: 14  // Larger legend text
                }
              }
            },
            tooltip: {
              bodyFont: {
                size: 14
              },
              titleFont: {
                size: 16
              }
            }
          },
          animation: false
        }
      });
    } else if (chartType === 'bar') {
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: chartData.datasets.map((dataset: any) => ({
            ...dataset,
            borderWidth: 2,
            borderRadius: 4,  // Rounded bars
            maxBarThickness: 50  // Thicker bars
          })),
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: title,
              font: {
                size: 22,  // Larger title
                weight: 'bold'
              },
              padding: {
                top: 20,
                bottom: 20
              }
            },
            legend: {
              position: 'top',
              labels: {
                boxWidth: 20,  // Larger legend boxes
                padding: 15,
                font: {
                  size: 16  // Larger legend text
                }
              }
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: chartData.yAxisLabel || 'Value',
                font: {
                  size: 16,  // Larger axis title
                  weight: 'bold'
                }
              },
              ticks: {
                font: {
                  size: 14  // Larger tick labels
                },
                padding: 10
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.3)'  // Lighter grid lines
              }
            },
            x: {
              ticks: {
                font: {
                  size: 14  // Larger tick labels
                },
                padding: 10
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.3)'  // Lighter grid lines
              }
            }
          },
          animation: false
        }
      });
    }
    
    const imgData = canvas.toDataURL('image/png', 1.0);  // Maximum quality
    
    if (chart) {
      chart.destroy();
    }
    document.body.removeChild(canvas);
    
    resolve(imgData);
  });
};

const prepareSymptomChartData = (symptomsData: any[]): any => {
  const symptomCounts: {[key: string]: number} = {};
  
  symptomsData.forEach(entry => {
    const symptom = entry.symptom_type;
    symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
  });
  
  return {
    labels: Object.keys(symptomCounts),
    values: Object.values(symptomCounts),
  };
};

const prepareMoodChartData = (moodData: any[]): any => {
  const dates = moodData.map(entry => format(new Date(entry.date), 'MMM d'));
  const moodScores = moodData.map(entry => entry.mood_score);
  const energyScores = moodData.map(entry => entry.energy_score);
  
  return {
    labels: dates,
    datasets: [
      {
        label: 'Mood',
        data: moodScores,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.3,
      },
      {
        label: 'Energy',
        data: energyScores,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.3,
      }
    ],
    yAxisLabel: 'Score (1-5)',
    xAxisLabel: 'Date',
  };
};

const prepareCyclePhaseChartData = (cycleData: any[]): any => {
  const phaseCounts: {[key: string]: number} = {};
  
  cycleData.forEach(entry => {
    const phase = entry.cycle_phase || 'Not specified';
    phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
  });
  
  return {
    labels: Object.keys(phaseCounts),
    values: Object.values(phaseCounts),
  };
};

const prepareMedicationAdherenceChartData = (medicationsData: any[], medicationHistoryData: any[]): any => {
  // Group medication history by medication id
  const medicationGroups: {[key: string]: any[]} = {};
  medicationHistoryData.forEach(entry => {
    const medId = entry.medication_id;
    if (!medicationGroups[medId]) {
      medicationGroups[medId] = [];
    }
    medicationGroups[medId].push(entry);
  });
  
  // Calculate adherence percentage for each medication
  const medicationNames: string[] = [];
  const adherenceValues: number[] = [];
  
  medicationsData.forEach(med => {
    if (med.id) {
      const history = medicationGroups[med.id] || [];
      // Simplified calculation - percentage of days in the period the medication was taken
      const takenDays = new Set(history.map(h => h.taken_at.split('T')[0])).size;
      const totalPossibleDays = 30; // Assuming a 30-day period
      const adherence = Math.round((takenDays / totalPossibleDays) * 100);
      
      medicationNames.push(med.name);
      adherenceValues.push(adherence);
    }
  });
  
  return {
    labels: medicationNames,
    datasets: [{
      label: 'Adherence (%)',
      data: adherenceValues,
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      borderRadius: 4,
    }],
    yAxisLabel: 'Adherence (%)',
  };
};

const createPDFReport = async (reportData: any, includeCharts: boolean): Promise<Blob> => {
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
  
  // Function to handle page breaks and header/footer
  const checkPageBreak = (minRemainingSpace: number) => {
    // Use the correct method to get Y position in jsPDF
    const currentY = (doc as any).lastAutoTable?.finalY || doc.internal.getCurrentPositionY?.() || doc.internal.getY();
    if (parseFloat(String(currentY)) > pageHeight - minRemainingSpace) {
      doc.addPage();
      currentPage++;
      addHeaderFooter(currentPage);
      return 25; // New Y position after page break
    }
    return parseFloat(String(currentY));
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
      head: [['Name
