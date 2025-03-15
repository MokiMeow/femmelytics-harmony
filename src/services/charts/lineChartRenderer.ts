
import { Chart, ChartConfiguration } from 'chart.js';
import { ChartData } from '../reportTypes';
import { getCommonChartConfig } from './baseChartConfig';

export const createLineChart = (
  ctx: CanvasRenderingContext2D,
  chartData: ChartData,
  title: string
): Chart => {
  return new Chart(ctx, {
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
          position: 'top',
          labels: {
            boxWidth: 25,
            padding: 20,
            font: {
              size: 16
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
              size: 18,
              weight: 'bold'
            }
          },
          ticks: {
            font: {
              size: 16
            },
            padding: 12,
            stepSize: 1
          },
          grid: {
            color: 'rgba(200, 200, 200, 0.3)'
          }
        },
        x: {
          title: {
            display: true,
            text: chartData.xAxisLabel || 'Date',
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
