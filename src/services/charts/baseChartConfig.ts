
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

// Common chart configuration 
export const getCommonChartConfig = () => ({
  responsive: false,
  maintainAspectRatio: false,
  animation: false as const, // Explicitly set as const to match expected type
  layout: {
    padding: {
      top: 10,
      right: 20,
      bottom: 20,
      left: 20
    }
  },
  font: {
    size: 8 // Smaller base font size
  }
});

// Function to create no data canvas
export const createNoDataCanvas = (
  canvasId: string, 
  title: string, 
  width = 450, // Smaller default width
  height = 250 // Smaller default height
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.id = canvasId;
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, canvas.width / 2, 25);
    
    ctx.font = '12px Arial';
    ctx.fillText('No data available for this chart', canvas.width / 2, canvas.height / 2);
  }
  
  return canvas;
};

// Fixed color palette for consistent chart colors - more distinct colors
export const colorPalette = [
  'rgba(255, 99, 132, 0.8)',   // pink
  'rgba(54, 162, 235, 0.8)',   // blue
  'rgba(255, 206, 86, 0.8)',   // yellow
  'rgba(75, 192, 192, 0.8)',   // teal
  'rgba(153, 102, 255, 0.8)',  // purple
  'rgba(255, 159, 64, 0.8)',   // orange
  'rgba(76, 175, 80, 0.8)',    // green
  'rgba(244, 67, 54, 0.8)',    // red
  'rgba(156, 39, 176, 0.8)',   // deep purple
  'rgba(0, 188, 212, 0.8)',    // cyan
];
