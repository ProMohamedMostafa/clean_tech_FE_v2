export interface FeedbackHistoryItem {
  userName: string;
  feedbackDate: string;
  rating: string;
  comment: string;
  status: string;
}

export interface FeedbackRatingData {
  excellent: number;
  good: number;
  average: number;
  poor: number;
}

export interface FeedbackReportConfig {
  fileName?: string;
  pdfTitle?: string;
  includeCoverPage?: boolean;
  reportInfo?: { reportDate: Date; preparedBy: string };
  headers?: string[];
  columnKeys?: string[];
  data?: FeedbackHistoryItem[];
}
