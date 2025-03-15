
import { Chart } from 'chart.js';
import { ChartData } from '../reportTypes';
import { getCommonChartConfig } from './baseChartConfig';

export const createBarChart = (
  ctx: CanvasRenderingContext2D,
  chartData: ChartData,
  title: string
): Chart => {
  return new Chart(ctx, {
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
              size: 18,
              weight: 'bold'
            }
          },
          ticks: {
            font: {
              size: 16
            },
            padding: 12,
            callback: (value) => `${value}%`
          },
          grid: {
            color: 'rgba(200, 200, 200, 0.3)'
          }
        },
        x: {
          ticks: {
            font: {
              size: 16
            },
            padding: 12,
            maxRotation: 45,
            minRotation: 0
          },
          grid: {
            color: 'rgba(200, 200, 200, 0.3)'
          }
        }
      }
    }
  });
};
