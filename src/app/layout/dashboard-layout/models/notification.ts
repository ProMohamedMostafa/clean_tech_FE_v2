export interface ApiResponse {
  statusCode: number;
  meta: any;
  succeeded: boolean;
  message: string;
  error: any;
  businessErrorCode: any;
  data: PaginatedNotifications;
}

export interface PaginatedNotifications {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  meta: any;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  succeeded: boolean;
  data: AppNotification[];
}

export interface AppNotification {
  id?: number;
  message: string;
  module: string;
  moduleId: number;
  actionType: string;
  actionTypeId: number;
  userName: string;
  userId: number;
  image: string | null;
  role: string;
  isRead: boolean;
  createdAt: string;
}
