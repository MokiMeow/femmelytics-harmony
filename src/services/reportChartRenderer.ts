
import { ChartData } from './reportTypes';
import { createNoDataCanvas } from './charts/baseChartConfig';
import { createLineChart } from './charts/lineChartRenderer';
import { createPieChart } from './charts/pieChartRenderer';
import { createBarChart } from './charts/barChartRenderer';

export const generateChartAsBase64 = (canvasId: string, chartData: ChartData, chartType: string, title: string): Promise<string> => {
  return new Promise((resolve) => {
    // Check if we have sufficient data to generate a chart
    const hasData = chartType === 'pie' 
      ? (chartData.labels?.length > 0 && chartData.values?.length > 0)
      : (chartData.labels?.length > 0 && chartData.datasets?.[0]?.data?.length > 0);

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
      chart = createLineChart(ctx, chartData, title);
    } else if (chartType === 'pie') {
      chart = createPieChart(ctx, chartData, title);
    } else if (chartType === 'bar') {
      chart = createBarChart(ctx, chartData, title);
    }
    
    const imgData = canvas.toDataURL('image/png', 1.0);  // Maximum quality
    
    if (chart) {
      chart.destroy();
    }
    document.body.removeChild(canvas);
    
    resolve(imgData);
  });
};
