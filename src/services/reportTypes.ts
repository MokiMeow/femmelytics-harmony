
export type ExportDataType = 'cycle' | 'symptoms' | 'mood' | 'medications' | 'all';
export type ExportPeriod = 7 | 30 | 90 | 180 | 365;

export interface ExportOptions {
  dataTypes: ExportDataType[];
  period: ExportPeriod;
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
