export interface TransactionHistoryItem {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: string;
  description: string;
}

export interface TransactionTypeData {
  income: number;
  expense: number;
  transfer: number;
}

export interface TransactionStatusData {
  pending: number;
  completed: number;
  failed: number;
}

export interface TransactionReportConfig {
  fileName?: string;
  pdfTitle?: string;
  includeCoverPage?: boolean;
  reportInfo?: { reportDate: Date; preparedBy: string };
  headers?: string[];
  columnKeys?: string[];
  data?: TransactionHistoryItem[];
}
