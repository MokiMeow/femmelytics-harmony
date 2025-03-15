
import { Chart, registerables } from 'chart.js';
import { ChartData } from './reportTypes';

// Register Chart.js components
Chart.register(...registerables);

export const generateChartAsBase64 = (canvasId: string, chartData: ChartData, chartType: string, title: string): Promise<string> => {
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
          datasets: chartData.datasets?.map((dataset: any) => ({
            ...dataset,
            borderWidth: 3,  // Thicker lines
            pointRadius: 5,  // Larger points
            pointHoverRadius: 8
          })) || [],
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
            data: chartData.values || [],
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
          datasets: chartData.datasets?.map((dataset: any) => ({
            ...dataset,
            borderWidth: 2,
            borderRadius: 4,  // Rounded bars
            maxBarThickness: 50  // Thicker bars
          })) || [],
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
