
export type ExportDataType = 'cycle' | 'symptoms' | 'mood' | 'medications' | 'all';
export type ExportPeriod = 7 | 30 | 90 | 180 | 365 | 'custom';

export interface ExportOptions {
  dataTypes: ExportDataType[];
  period: ExportPeriod;
  startDate?: Date;  // For custom date range
  endDate?: Date;    // For custom date range
  includeCharts: boolean;
  includeSummary: boolean;
  medicationFilter?: string; // 'all' or comma-separated medication IDs
}

export interface ChartData {
  labels: string[];
  values?: number[];
  datasets?: any[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

// Type definitions for chart generation
export interface PieChartData {
  labels: string[];
  values: number[];
}

export interface LineChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface BarChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

// TypeScript helper type for Chart.js LegendItem
export interface CustomLegendItem {
  text: string;
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  hidden: boolean;
  index: number;
}
