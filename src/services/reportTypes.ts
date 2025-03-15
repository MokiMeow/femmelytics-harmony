
export type ExportDataType = 'cycle' | 'symptoms' | 'mood' | 'medications' | 'all';
export type ExportPeriod = 7 | 30 | 90 | 180 | 365 | 'custom';

export interface ExportOptions {
  dataTypes: ExportDataType[];
  period: ExportPeriod;
  startDate?: Date;  // For custom date range
  endDate?: Date;    // For custom date range
  includeCharts: boolean;
  includeSummary: boolean;
}

export interface ChartData {
  labels: string[];
  values?: number[];
  datasets?: any[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}
