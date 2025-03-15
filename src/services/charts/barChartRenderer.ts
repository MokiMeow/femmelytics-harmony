
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
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 35
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
            weight: 'bold' as const
          },
          padding: {
            top: 10,
            bottom: 15
          }
        },
        legend: {
          display: false,
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
          max: 100,
          title: {
            display: true,
            text: chartData.yAxisLabel || 'Value',
            font: {
              size: 14,
              weight: 'bold' as const
            }
          },
          ticks: {
            font: {
              size: 11
            },
            padding: 5,
            callback: (value) => `${value}%`
          },
          grid: {
            color: 'rgba(200, 200, 200, 0.3)'
          }
        },
        x: {
          ticks: {
            font: {
              size: 11
            },
            padding: 5,
            maxRotation: 45,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8
          },
          grid: {
            color: 'rgba(200, 200, 200, 0.3)'
          }
        }
      }
    }
  });
};
