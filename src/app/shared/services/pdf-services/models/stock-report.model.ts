export interface StockReportConfig {
  fileName: string;
  headers: string[];
  data: any[];

  columnKeys?: string[];
  columnFormatter?: (row: any) => any[];

  pdfTitle?: string;
  includeCoverPage?: boolean;

  reportInfo?: {
    warehouse?: string;
    generatedBy?: string;
    generatedAt?: Date;
    preparedBy?: string;
  };
}
