export interface TaskHistoryItem {
  id: string;
  taskName: string;
  assignedTo: string;
  priority: string;
  status: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface TaskStatusData {
  pending: number;
  inProgress: number;
  completed: number;
}

export interface TaskPriorityData {
  high: number;
  medium: number;
  low: number;
}

// task-report.model.ts
export interface TaskReportConfig {
  fileName?: string;
  pdfTitle?: string;
  includeCoverPage?: boolean;
  reportInfo?: {
    fromDate?: string;
    toDate?: string;
    preparedBy?: string;
    reportDate?: Date;
  };
  headers?: string[];
  columnKeys?: string[];
  data?: TaskHistoryItem[];
  // Add API parameters
  startDate?: string;
  endDate?: string;
  status?: number;
  priority?: number;
  assignTo?: number;
}

// task-report.model.ts
export interface TaskReportApiResponse {
  statusCode: number;
  meta: any;
  succeeded: boolean;
  message: string;
  error: any;
  businessErrorCode: any;
  data: TaskReportData;
}

export interface TaskReportData {
  from: string;
  to: string;
  total: number;
  status: StatusData;
  priority: PriorityData;
  tasks: TaskHistoryItem[];
}

export interface StatusData {
  labels: string[];
  values: number[];
}

export interface PriorityData {
  labels: string[];
  values: number[];
}

// Update TaskStatusData and TaskPriorityData to be more flexible
export interface TaskStatusData {
  pending: number;
  inProgress: number;
  completed: number;
  blocked: number;
  waitingForApproval?: number;
  rejected?: number;
  notResolved?: number;
  overdue?: number;
}

export interface TaskPriorityData {
  high: number;
  medium: number;
  low: number;
}
