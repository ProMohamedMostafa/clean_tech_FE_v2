// ==================== BASE RESPONSE MODELS ====================
export interface BaseResponse {
  succeeded: boolean;
  message?: string;
  errors?: any[];
}

export interface PagedResponse<T> extends BaseResponse {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ==================== LEAVE MODELS ====================
export interface LeaveItem {
  id: number;
  userId: number;
  userName: string;
  role: string;
  startDate: string;
  endDate: string;
  duration: number; // in days
  type: number;
  typeName: string;
  status: string; // 'Pending', 'Approved', 'Rejected'
  reason: string;
  rejectionReason?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: string;
}

export interface LeaveDetails extends LeaveItem {
  // Additional detailed fields if needed
  comments?: LeaveComment[];
  history?: LeaveHistoryItem[];
}

export interface LeaveComment {
  id: number;
  leaveId: number;
  userId: number;
  userName: string;
  comment: string;
  createdAt: string;
}

export interface LeaveHistoryItem {
  id: number;
  leaveId: number;
  action: string; // 'Created', 'Updated', 'Approved', 'Rejected'
  changedBy: number;
  changedByName: string;
  changes?: string; // JSON string of changes
  createdAt: string;
}

export interface LeaveStatusCount {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface LeaveType {
  id: number;
  name: string;
  description?: string;
  isPaid: boolean;
  maxDays: number;
  requiresApproval: boolean;
}

export interface LeaveRequest {
  startDate: string;
  endDate: string;
  type: number;
  reason: string;
  file?: File;
}

export interface LeaveApproval {
  leaveId: number;
  approved: boolean;
  rejectionReason?: string;
}

// ==================== RESPONSE MODELS ====================
export interface LeaveResponse extends BaseResponse {
  data: LeaveItem;
}

export interface LeaveListResponse extends PagedResponse<LeaveItem> {}

export interface LeaveStatusCountResponse extends BaseResponse {
  data: LeaveStatusCount;
}

export interface LeaveTypeResponse extends BaseResponse {
  data: LeaveType[];
}
