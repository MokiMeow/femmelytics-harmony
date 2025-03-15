
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
      top: 20,
      right: 25,
      bottom: 25,
      left: 25
    }
  },
  font: {
    size: 10, // Slightly larger for better readability
    family: 'Arial',
    weight: 'normal'
  },
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        padding: 15,
        boxWidth: 15,
        boxHeight: 15,
        font: {
          size: 11
        }
      }
    },
    title: {
      display: true,
      font: {
        size: 14,
        weight: 'bold'
      },
      padding: {
        top: 10,
        bottom: 10
      }
    },
    tooltip: {
      enabled: false // Disable tooltips for static PDF rendering
    }
  }
});

// Function to create no data canvas
export const createNoDataCanvas = (
  canvasId: string, 
  title: string, 
  width = 450, // Default width
  height = 280 // Increased default height
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.id = canvasId;
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Clear background
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#444444';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, canvas.width / 2, 25);
    
    // Draw border
    ctx.strokeStyle = '#dddddd';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Draw message
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText('No data available for this chart', canvas.width / 2, canvas.height / 2);
  }
  
  return canvas;
};

// Fixed color palette for consistent chart colors - more distinct colors with better opacity
export const colorPalette = [
  'rgba(255, 99, 132, 0.9)',   // pink
  'rgba(54, 162, 235, 0.9)',   // blue
  'rgba(255, 206, 86, 0.9)',   // yellow
  'rgba(75, 192, 192, 0.9)',   // teal
  'rgba(153, 102, 255, 0.9)',  // purple
  'rgba(255, 159, 64, 0.9)',   // orange
  'rgba(76, 175, 80, 0.9)',    // green
  'rgba(244, 67, 54, 0.9)',    // red
  'rgba(156, 39, 176, 0.9)',   // deep purple
  'rgba(0, 188, 212, 0.9)',    // cyan
];
