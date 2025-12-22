export interface TransactionReportConfig {
  fileName: string;
  headers: string[];
  data: any[];

  columnKeys?: string[];
  columnFormatter?: (row: any) => any[];

  pdfTitle?: string;
  includeCoverPage?: boolean;

  reportInfo?: {
    reportDate?: Date;
    preparedBy?: string;
    period?: string;
  };
}
