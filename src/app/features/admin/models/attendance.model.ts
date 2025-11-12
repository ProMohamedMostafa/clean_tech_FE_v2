// نماذج بيانات للردود (تقدر تعدل أو توسعهم حسب حاجتك)
export interface AttendanceStatusResponse {
  statusCode: number;
  succeeded: boolean;
  message: string;
  data: any; // حط نوع أدق حسب الداتا عندك
}

export interface AttendanceHistoryItem {
  userId: number;
  firstName: string;
  lastName: string;
  userName: string;
  role: string;
  startShift: string;
  endShift: string;
  clockIn: string;
  clockOut: string | null;
  duration: string | null;
  date: string;
  status: string;
  shiftName: string;
}

export interface AttendanceHistoryResponse {
  statusCode: number;
  succeeded: boolean;
  message: string;
  data: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    data: AttendanceHistoryItem[];
  };
}

export interface AttendanceStatusCountResponse {
  statusCode: number;
  succeeded: boolean;
  message: string;
  data: {
    labels: string[];
    values: number[];
  };
}
