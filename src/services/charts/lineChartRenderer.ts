
import { Chart } from 'chart.js';
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
        borderWidth: 2,  // Thinner lines
        pointRadius: 3,  // Smaller points
        pointHoverRadius: 5
      })) || [],
    },
    options: {
      ...getCommonChartConfig(),
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 15
          }
        },
        legend: {
          position: 'top',
          labels: {
            boxWidth: 15,
            padding: 10,
            font: {
              size: 12
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
          padding: 8
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: chartData.yAxisLabel || 'Value',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          ticks: {
            font: {
              size: 11
            },
            padding: 5,
            stepSize: 1,
            maxTicksLimit: 5
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
              size: 14,
              weight: 'bold'
            }
          },
          ticks: {
            font: {
              size: 11
            },
            padding: 5,
            maxRotation: 45,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10
          },
          grid: {
            color: 'rgba(200, 200, 200, 0.3)'
          }
        }
      }
    }
  });
};
