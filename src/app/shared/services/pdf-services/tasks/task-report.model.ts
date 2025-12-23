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
  blocked: number;
}

export interface TaskPriorityData {
  high: number;
  medium: number;
  low: number;
}

export interface TaskReportConfig {
  fileName?: string;
  pdfTitle?: string;
  includeCoverPage?: boolean;
  reportInfo?: { reportDate: Date; preparedBy: string };
  headers?: string[];
  columnKeys?: string[];
  data?: TaskHistoryItem[];
}
