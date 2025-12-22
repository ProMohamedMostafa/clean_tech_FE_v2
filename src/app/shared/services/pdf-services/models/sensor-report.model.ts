export interface SensorReportConfig {
  fileName: string;
  headers: string[];
  data: any[];

  columnKeys?: string[];
  columnFormatter?: (row: any) => any[];

  pdfTitle?: string;
  includeCoverPage?: boolean;

  reportInfo?: {
    sensorType?: string;
    location?: string;
    generatedAt?: Date;
    preparedBy?: string;
  };
}
