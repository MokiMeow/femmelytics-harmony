
import { ChartData, CustomLegendItem } from './reportTypes';
import { createNoDataCanvas, colorPalette, getCommonChartConfig } from './charts/baseChartConfig';
import { Chart, ChartConfiguration } from 'chart.js';

// Function to convert chart data to image
export const generateChartAsBase64 = (canvasId: string, chartData: ChartData, chartType: string, title: string): Promise<string> => {
  return new Promise((resolve) => {
    // Check if we have sufficient data to generate a chart
    let hasData = false;
    
    if (chartType === 'pie') {
      hasData = !!(chartData.labels?.length > 0 && chartData.values?.length > 0);
    } else {
      hasData = !!(chartData.labels?.length > 0 && chartData.datasets?.[0]?.data?.length > 0);
    }

    if (!hasData) {
      // Create a canvas with a "No data" message instead of a chart
      const canvas = createNoDataCanvas(canvasId, title);
      document.body.appendChild(canvas);
      
      const imgData = canvas.toDataURL('image/png');
      document.body.removeChild(canvas);
      resolve(imgData);
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.width = 450;  // Smaller width for better PDF fit
    canvas.height = 250; // Smaller height proportionally
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Set up proper canvas size
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.width * dpr;
    canvas.height = canvas.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Create appropriate chart based on type
    let chart: Chart | null = null;
    
    try {
      if (chartType === 'line') {
        const config: ChartConfiguration = {
          type: 'line',
          data: {
            labels: chartData.labels,
            datasets: chartData.datasets || []
          },
          options: {
            ...getCommonChartConfig(),
            plugins: {
              title: {
                display: true,
                text: title,
                font: { 
                  size: 12, 
                  weight: 'bold' as const
                }
              },
              legend: {
                display: true,
                position: 'top',
                labels: {
                  font: { size: 9 },
                  boxWidth: 8
                }
              },
              tooltip: {
                enabled: false // Disable tooltips for PDF rendering
              }
            },
            scales: {
              x: {
                ticks: {
                  font: { size: 7 },
                  maxRotation: 45,
                  minRotation: 45,
                  autoSkip: true,
                  maxTicksLimit: 6
                },
                title: {
                  display: !!chartData.xAxisLabel,
                  text: chartData.xAxisLabel || '',
                  font: { size: 9 }
                }
              },
              y: {
                beginAtZero: true,
                ticks: {
                  font: { size: 7 },
                  maxTicksLimit: 5
                },
                title: {
                  display: !!chartData.yAxisLabel,
                  text: chartData.yAxisLabel || '',
                  font: { size: 9 }
                }
              }
            }
          }
        };
        chart = new Chart(ctx, config);
      } else if (chartType === 'pie') {
        const config: ChartConfiguration = {
          type: 'pie',
          data: {
            labels: chartData.labels,
            datasets: [{
              data: chartData.values || [],
              backgroundColor: chartData.labels.map((_, i) => colorPalette[i % colorPalette.length])
            }]
          },
          options: {
            ...getCommonChartConfig(),
            plugins: {
              title: {
                display: true,
                text: title,
                font: { 
                  size: 12, 
                  weight: 'bold' as const 
                }
              },
              legend: {
                display: true,
                position: 'right',
                labels: {
                  font: { size: 8 },
                  boxWidth: 8,
                  generateLabels: (chart) => {
                    const data = chart.data;
                    if (data.labels?.length && data.datasets.length) {
                      return data.labels.map((label, i) => {
                        const dataset = data.datasets[0];
                        const value = dataset.data?.[i];
                        return {
                          text: `${label}: ${value}`,
                          fillStyle: colorPalette[i % colorPalette.length],
                          strokeStyle: '#fff',
                          lineWidth: 1,
                          hidden: false,
                          index: i
                        } as CustomLegendItem;
                      });
                    }
                    return [];
                  }
                }
              },
              tooltip: {
                enabled: false // Disable tooltips for PDF rendering
              }
            }
          }
        };
        chart = new Chart(ctx, config);
      } else if (chartType === 'bar') {
        const config: ChartConfiguration = {
          type: 'bar',
          data: {
            labels: chartData.labels,
            datasets: chartData.datasets || []
          },
          options: {
            ...getCommonChartConfig(),
            indexAxis: 'x',
            plugins: {
              title: {
                display: true,
                text: title,
                font: { 
                  size: 12, 
                  weight: 'bold' as const 
                }
              },
              legend: {
                display: chartData.datasets && chartData.datasets.length > 1,
                position: 'top',
                labels: {
                  font: { size: 8 },
                  boxWidth: 8
                }
              },
              tooltip: {
                enabled: false // Disable tooltips for PDF rendering
              }
            },
            scales: {
              x: {
                ticks: {
                  font: { size: 7 },
                  maxRotation: 45,
                  minRotation: 45,
                  autoSkip: true,
                  maxTicksLimit: 6
                },
                title: {
                  display: !!chartData.xAxisLabel,
                  text: chartData.xAxisLabel || '',
                  font: { size: 9 }
                }
              },
              y: {
                beginAtZero: true,
                ticks: {
                  font: { size: 7 },
                  maxTicksLimit: 5
                },
                title: {
                  display: !!chartData.yAxisLabel,
                  text: chartData.yAxisLabel || '',
                  font: { size: 9 }
                }
              }
            }
          }
        };
        chart = new Chart(ctx, config);
      }
      
      // Allow chart to render with a longer timeout
      setTimeout(() => {
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        if (chart) {
          chart.destroy();
        }
        document.body.removeChild(canvas);
        
        resolve(imgData);
      }, 500); // Increased timeout for better rendering
    } catch (error) {
      console.error('Error generating chart:', error);
      // Remove canvas if there was an error
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
      // Create a fallback "Error generating chart" canvas
      const errorCanvas = createNoDataCanvas(canvasId, `Error: ${title}`);
      document.body.appendChild(errorCanvas);
      const imgData = errorCanvas.toDataURL('image/png');
      document.body.removeChild(errorCanvas);
      resolve(imgData);
    }
  });
};
