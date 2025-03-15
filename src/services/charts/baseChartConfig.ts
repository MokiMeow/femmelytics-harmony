
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

// Common chart configuration 
export const getCommonChartConfig = () => ({
  responsive: false,
  maintainAspectRatio: false,
  animation: false,
  layout: {
    padding: 20  // More padding around chart area
  }
});

// Function to create no data canvas
export const createNoDataCanvas = (
  canvasId: string, 
  title: string, 
  width = 800, 
  height = 400
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.id = canvasId;
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, canvas.width / 2, 60);
    
    ctx.font = '20px Arial';
    ctx.fillText('Not sufficient data to create this chart', canvas.width / 2, canvas.height / 2);
  }
  
  return canvas;
};

// Fixed color palette for consistent chart colors
export const colorPalette = [
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
