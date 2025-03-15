
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
      canvas.width = 400;
      canvas.height = 200;
      document.body.appendChild(canvas);
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, canvas.width / 2, 30);
        
        ctx.font = '14px Arial';
        ctx.fillText('Not sufficient data to create this chart', canvas.width / 2, canvas.height / 2);
      }
      
      const imgData = canvas.toDataURL('image/png');
      document.body.removeChild(canvas);
      resolve(imgData);
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.width = 400;
    canvas.height = 220;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    let chart;
    
    if (chartType === 'line') {
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: chartData.datasets,
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: title,
              font: {
                size: 14,
              },
              padding: {
                top: 10,
                bottom: 10
              }
            },
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                padding: 10,
                font: {
                  size: 11
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
                  size: 11
                }
              },
              ticks: {
                font: {
                  size: 10
                }
              }
            },
            x: {
              title: {
                display: true,
                text: chartData.xAxisLabel || 'Date',
                font: {
                  size: 11
                }
              },
              ticks: {
                font: {
                  size: 10
                }
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
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
              'rgba(199, 199, 199, 0.6)',
              'rgba(83, 102, 255, 0.6)',
            ],
            borderWidth: 1
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
                size: 14,
              },
              padding: {
                top: 10,
                bottom: 10
              }
            },
            legend: {
              position: 'right',
              labels: {
                boxWidth: 12,
                padding: 10,
                font: {
                  size: 10
                }
              }
            },
          },
          animation: false
        }
      });
    } else if (chartType === 'bar') {
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: chartData.datasets,
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: title,
              font: {
                size: 14,
              },
              padding: {
                top: 10,
                bottom: 10
              }
            },
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                padding: 10,
                font: {
                  size: 11
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
                  size: 11
                }
              },
              ticks: {
                font: {
                  size: 10
                }
              }
            },
            x: {
              ticks: {
                font: {
                  size: 10
                }
              }
            }
          },
          animation: false
        }
      });
    }
    
    const imgData = canvas.toDataURL('image/png');
    
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

const createPDFReport = async (reportData: any, includeCharts: boolean): Promise<Blob> => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Health Report', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Date Range: ${format(new Date(reportData.startDate), 'MMM d, yyyy')} - ${format(new Date(reportData.endDate), 'MMM d, yyyy')}`, 105, 25, { align: 'center' });
  
  let yPosition = 35;
  
  if (reportData.cycleData && reportData.cycleData.length > 0) {
    doc.setFontSize(16);
    doc.text('Menstrual Cycle Data', 14, yPosition);
    yPosition += 10;
    
    const cycleTableData = reportData.cycleData.map((entry: any) => [
      format(new Date(entry.date), 'MMM d, yyyy'),
      entry.cycle_phase || 'Not specified',
      entry.flow_intensity,
      entry.notes || '-'
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Phase', 'Flow', 'Notes']],
      body: cycleTableData,
      startY: yPosition
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    if (includeCharts) {
      if (yPosition > 180) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
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
        
        doc.addImage(chartImgData, 'PNG', 15, yPosition, 180, 100);
        yPosition += 110;
      } catch (error) {
        console.error('Error generating cycle chart:', error);
      }
    }
  }
  
  if (reportData.symptomsData && reportData.symptomsData.length > 0) {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Symptoms Data', 14, yPosition);
    yPosition += 10;
    
    const symptomsTableData = reportData.symptomsData.map((entry: any) => [
      format(new Date(entry.date), 'MMM d, yyyy'),
      entry.symptom_type,
      entry.severity || '-'
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Symptom', 'Severity (1-5)']],
      body: symptomsTableData,
      startY: yPosition
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    if (includeCharts && reportData.symptomsData.length > 0) {
      if (yPosition > 180) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
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
        
        doc.addImage(chartImgData, 'PNG', 15, yPosition, 180, 100);
        yPosition += 110;
      } catch (error) {
        console.error('Error generating symptom chart:', error);
      }
    }
  }
  
  if (reportData.moodData && reportData.moodData.length > 0) {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Mood & Energy Data', 14, yPosition);
    yPosition += 10;
    
    const moodTableData = reportData.moodData.map((entry: any) => [
      format(new Date(entry.date), 'MMM d, yyyy'),
      entry.mood_score || '-',
      entry.energy_score || '-',
      entry.notes || '-'
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Mood (1-5)', 'Energy (1-5)', 'Notes']],
      body: moodTableData,
      startY: yPosition
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    if (includeCharts && reportData.moodData.length > 0) {
      if (yPosition > 180) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
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
        
        doc.addImage(chartImgData, 'PNG', 15, yPosition, 180, 100);
        yPosition += 110;
      } catch (error) {
        console.error('Error generating mood chart:', error);
      }
    }
  }
  
  if (reportData.medicationsData && reportData.medicationsData.length > 0) {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Medications', 14, yPosition);
    yPosition += 10;
    
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
      styles: { cellWidth: 'auto' },
      columnStyles: { 6: { cellWidth: 40 } }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }
  
  if (reportData.summary) {
    doc.addPage();
    
    doc.setFontSize(16);
    doc.text('Health Summary (AI Generated)', 14, 20);
    
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(reportData.summary, 180);
    doc.text(splitText, 14, 35);
  }
  
  return doc.output('blob');
};

export const syncWithGoogleCalendar = async (calendarId: string, accessToken: string): Promise<boolean> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    const userId = userData.user?.id;
    if (!userId) throw new Error('User not authenticated');
    
    const { data: cycleData, error: cycleError } = await supabase
      .from('cycle_statistics')
      .select('next_predicted_date, average_period_length, average_cycle_length')
      .eq('user_id', userId)
      .single();
      
    if (cycleError) throw cycleError;
    if (!cycleData?.next_predicted_date) return false;
    
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: 'Period Start Date',
        description: 'Predicted start of your next menstrual cycle',
        start: {
          date: cycleData.next_predicted_date
        },
        end: {
          date: format(new Date(new Date(cycleData.next_predicted_date).getTime() + 
            (cycleData.average_period_length || 5) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
        },
        colorId: '11',
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 24 * 60 }]
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create calendar event: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    return false;
  }
};
