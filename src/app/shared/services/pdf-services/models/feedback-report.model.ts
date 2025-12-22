export interface FeedbackReportConfig {
  fileName: string;
  headers: string[];
  data: any[];

  columnKeys?: string[];
  columnFormatter?: (row: any) => any[];

  pdfTitle?: string;
  includeCoverPage?: boolean;

  reportInfo?: {
    ratingAverage?: number;
    totalFeedbacks?: number;
    period?: string;
  };
}
