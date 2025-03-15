
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
    canvas.width = 1000;  // Increased for better resolution
    canvas.height = 550; // Increased for better resolution
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
            pointRadius: 6,  // Larger points
            pointHoverRadius: 9
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
                size: 24,  // Larger title
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
                boxWidth: 25,  // Larger legend boxes
                padding: 20,
                font: {
                  size: 16  // Larger legend text
                }
              }
            },
            tooltip: {
              bodyFont: {
                size: 16  // Larger tooltip text
              },
              titleFont: {
                size: 18  // Larger tooltip title
              },
              padding: 12
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: chartData.yAxisLabel || 'Value',
                font: {
                  size: 18,  // Larger axis title
                  weight: 'bold'
                }
              },
              ticks: {
                font: {
                  size: 16  // Larger tick labels
                },
                padding: 12,
                stepSize: 1  // Integer step size for scores 1-5
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
                  size: 18,  // Larger axis title
                  weight: 'bold'
                }
              },
              ticks: {
                font: {
                  size: 16  // Larger tick labels
                },
                padding: 12,
                maxRotation: 45,  // Rotated labels to prevent overlap
                minRotation: 0
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.3)'  // Lighter grid lines
              }
            }
          },
          animation: false,
          layout: {
            padding: 20  // More padding around chart area
          }
        }
      });
    } else if (chartType === 'pie') {
      // Create a limited color palette to ensure consistency
      const colorPalette = [
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
      ];
      
      // Limit the number of slices to display to avoid overcrowding
      // If there are more than 7 items, group the smallest ones as "Other"
      let labels = [...chartData.labels || []];
      let values = [...chartData.values || []];
      
      if (labels.length > 7) {
        // Sort items by value
        const combined = labels.map((label, i) => ({ label, value: values[i] }));
        combined.sort((a, b) => b.value - a.value);
        
        // Take top 6 items
        const topItems = combined.slice(0, 6);
        
        // Sum the rest as "Other"
        const otherValue = combined.slice(6).reduce((sum, item) => sum + item.value, 0);
        
        labels = topItems.map(item => item.label);
        values = topItems.map(item => item.value);
        
        // Add "Other" category if it has a value
        if (otherValue > 0) {
          labels.push('Other');
          values.push(otherValue);
        }
      }
      
      chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: colorPalette.slice(0, labels.length),
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
                size: 24,  // Larger title
                weight: 'bold'
              },
              padding: {
                top: 25,
                bottom: 25
              }
            },
            legend: {
              position: 'right',
              labels: {
                boxWidth: 20,  // Larger legend boxes
                padding: 15,
                font: {
                  size: 16  // Larger legend text
                },
                // Generate more readable labels with percentages
                generateLabels: (chart) => {
                  const datasets = chart.data.datasets;
                  const total = datasets[0].data.reduce((sum: number, value: number) => sum + value, 0);
                  
                  return chart.data.labels.map((label, i) => {
                    const value = datasets[0].data[i] as number;
                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                    
                    return {
                      text: `${label} (${percentage}%)`,
                      fillStyle: datasets[0].backgroundColor[i],
                      strokeStyle: datasets[0].borderColor,
                      lineWidth: datasets[0].borderWidth,
                      hidden: isNaN(value) || value === 0,
                      index: i
                    };
                  });
                }
              }
            },
            tooltip: {
              bodyFont: {
                size: 16
              },
              titleFont: {
                size: 18
              },
              padding: 12,
              callbacks: {
                label: (context) => {
                  const dataset = context.dataset;
                  const total = dataset.data.reduce((sum: number, value: number) => sum + value, 0);
                  const value = dataset.data[context.dataIndex] as number;
                  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                  return `${context.label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          animation: false,
          layout: {
            padding: 20  // More padding
          }
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
            borderRadius: 6,  // Rounded bars
            maxBarThickness: 65  // Thicker bars
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
                size: 24,  // Larger title
                weight: 'bold'
              },
              padding: {
                top: 20,
                bottom: 20
              }
            },
            legend: {
              display: false,  // Hide legend for better clarity in bar charts
            },
            tooltip: {
              bodyFont: {
                size: 16
              },
              titleFont: {
                size: 18
              },
              padding: 12
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 100,  // For percentages
              title: {
                display: true,
                text: chartData.yAxisLabel || 'Value',
                font: {
                  size: 18,  // Larger axis title
                  weight: 'bold'
                }
              },
              ticks: {
                font: {
                  size: 16  // Larger tick labels
                },
                padding: 12,
                callback: (value) => `${value}%`  // Add % sign to y-axis values
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.3)'  // Lighter grid lines
              }
            },
            x: {
              ticks: {
                font: {
                  size: 16  // Larger tick labels
                },
                padding: 12,
                maxRotation: 45,  // Angled labels for better readability
                minRotation: 0
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.3)'  // Lighter grid lines
              }
            }
          },
          animation: false,
          layout: {
            padding: 20  // More padding
          }
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
