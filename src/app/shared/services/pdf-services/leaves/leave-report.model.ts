export interface LeaveHistoryItem {
  id: string;
  userId: string;
  userName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: string;
  reason: string;
}

export interface LeaveStatusData {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
}

export interface LeaveTypeData {
  total: number;
  annual: number;
  sick: number;
  casual: number;
}