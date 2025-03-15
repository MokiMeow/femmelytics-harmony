
import { Chart, LegendItem, ChartConfiguration, Color } from 'chart.js';
import { ChartData } from '../reportTypes';
import { getCommonChartConfig, colorPalette } from './baseChartConfig';

// Process and limit pie chart data to prevent overcrowding
export const processPieChartData = (
  labels: string[] = [], 
  values: number[] = []
): { labels: string[], values: number[] } => {
  if (labels.length <= 7) {
    return { labels, values };
  }
  
  // Sort items by value
  const combined = labels.map((label, i) => ({ label, value: values[i] }));
  combined.sort((a, b) => b.value - a.value);
  
  // Take top 6 items
  const topItems = combined.slice(0, 6);
  
  // Sum the rest as "Other"
  const otherValue = combined.slice(6).reduce((sum, item) => sum + item.value, 0);
  
  const newLabels = topItems.map(item => item.label);
  const newValues = topItems.map(item => item.value);
  
  // Add "Other" category if it has a value
  if (otherValue > 0) {
    newLabels.push('Other');
    newValues.push(otherValue);
  }
  
  return { labels: newLabels, values: newValues };
};

export const createPieChart = (
  ctx: CanvasRenderingContext2D,
  chartData: ChartData,
  title: string
): Chart => {
  // Process data to limit slices for better readability
  const { labels, values } = processPieChartData(
    chartData.labels as string[], 
    chartData.values as number[]
  );
  
  return new Chart(ctx, {
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
      ...getCommonChartConfig(),
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            size: 24,
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
            boxWidth: 20,
            padding: 15,
            font: {
              size: 16
            },
            generateLabels(chart): LegendItem[] {
              const dataset = chart.data.datasets[0];
              const { labels } = chart.data;
              
              if (!dataset || !labels) return [];
              
              // Safely sum all values for percentage calculation
              const total = dataset.data.reduce((sum: number, val) => {
                return sum + (typeof val === 'number' ? val : 0);
              }, 0);
              
              return labels.map((label, i) => {
                // Safe type checking for dataset values
                const value = dataset.data[i];
                const numValue = typeof value === 'number' ? value : 0;
                const percentage = total > 0 ? Math.round((numValue / total) * 100) : 0;
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor instanceof Array 
                    ? dataset.backgroundColor[i] 
                    : dataset.backgroundColor,
                  strokeStyle: dataset.borderColor as Color,
                  lineWidth: 2,
                  hidden: isNaN(numValue) || numValue === 0,
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
              
              // Safely calculate the total
              const total = dataset.data.reduce((sum: number, val) => {
                return sum + (typeof val === 'number' ? val : 0);
              }, 0);
              
              // Safe type checking for the current value
              const value = dataset.data[context.dataIndex];
              const numValue = typeof value === 'number' ? value : 0;
              
              const percentage = total > 0 ? Math.round((numValue / total) * 100) : 0;
              return `${context.label}: ${numValue} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
};
