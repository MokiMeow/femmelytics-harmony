
import { Chart, ChartConfiguration, Color } from 'chart.js';
import { ChartData, CustomLegendItem } from '../reportTypes';
import { getCommonChartConfig, colorPalette } from './baseChartConfig';

// Process and limit pie chart data to prevent overcrowding
export const processPieChartData = (
  labels: string[] = [], 
  values: number[] = []
): { labels: string[], values: number[] } => {
  if (labels.length <= 5) { // Reduce to 5 slices max for better readability
    return { labels, values };
  }
  
  // Sort items by value
  const combined = labels.map((label, i) => ({ label, value: values[i] }));
  combined.sort((a, b) => b.value - a.value);
  
  // Take top 4 items
  const topItems = combined.slice(0, 4);
  
  // Sum the rest as "Other"
  const otherValue = combined.slice(4).reduce((sum, item) => sum + item.value, 0);
  
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
  
  const pieBackgroundColors = colorPalette.slice(0, labels.length);
  
  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: pieBackgroundColors,
        borderWidth: 1.5,
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
            size: 18,
            weight: 'bold' as const
          },
          padding: {
            top: 10,
            bottom: 15
          }
        },
        legend: {
          position: 'right',
          labels: {
            boxWidth: 15,
            padding: 10,
            font: {
              size: 12
            },
            generateLabels: function(chart) {
              const data = chart.data;
              const datasets = data.datasets;
              
              if (!datasets || datasets.length === 0) {
                return [];
              }

              const dataset = datasets[0];
              
              // Calculate total to get percentages
              let total = 0;
              if (dataset.data) {
                for (let i = 0; i < dataset.data.length; i++) {
                  if (typeof dataset.data[i] === 'number') {
                    total += dataset.data[i] as number;
                  }
                }
              }
              
              // Generate items
              return (data.labels || []).map((label, i) => {
                // Safely get the value
                const value = dataset.data && i < dataset.data.length && typeof dataset.data[i] === 'number' 
                  ? dataset.data[i] as number
                  : 0;
                  
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: pieBackgroundColors[i],
                  strokeStyle: '#fff',
                  lineWidth: 1,
                  hidden: isNaN(value) || value === 0,
                  index: i
                };
              });
            }
          }
        },
        tooltip: {
          bodyFont: {
            size: 12
          },
          titleFont: {
            size: 14
          },
          padding: 8,
          callbacks: {
            label: (context) => {
              const dataset = context.dataset;
              const total = dataset.data.reduce((sum, value) => {
                return sum + (typeof value === 'number' ? value : 0);
              }, 0);
              
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
