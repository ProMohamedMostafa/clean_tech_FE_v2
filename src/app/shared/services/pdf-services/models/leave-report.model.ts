export interface LeaveReportConfig {
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
    description?: string;
  };

  coverPageConfig?: {
    title?: string;
    subtitle?: string;
    confidentiality?: string;
    footerText?: string;
  };
}
