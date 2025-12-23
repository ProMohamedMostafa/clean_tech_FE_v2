export interface SensorHistoryItem {
  id: string;
  name: string;
  type: string;
  value: number;
  status: string;
  recordedAt: string;
}

export interface SensorTypeData {
  temperature: number;
  humidity: number;
  pressure: number;
}

export interface SensorStatusData {
  active: number;
  inactive: number;
  error: number;
}

export interface SensorReportConfig {
  fileName?: string;
  pdfTitle?: string;
  includeCoverPage?: boolean;
  reportInfo?: { reportDate: Date; preparedBy: string };
  headers?: string[];
  columnKeys?: string[];
  data?: SensorHistoryItem[];
}
