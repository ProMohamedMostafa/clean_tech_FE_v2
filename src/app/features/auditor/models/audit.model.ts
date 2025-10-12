export interface AuditAnswer {
  questionId: number;
  type: number;
  answer: string;
}

export interface AuditHistoryItem {
  date: string;
  time: string;
}

export interface AuditHistoryData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  succeeded: boolean;
  data: AuditHistoryItem[];
  meta?: any;
}

export interface AuditHistoryResponse {
  statusCode: number;
  meta?: any;
  succeeded: boolean;
  message: string;
  error?: any;
  businessErrorCode?: any;
  data: AuditHistoryData;
}
