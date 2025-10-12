export interface Device {
  id: number;
  name: string;
  description: string;
  applicationName: string;
  lastSeenAt: string;
  active: boolean;
  battery: number;
  pointId: number;
  pointName: string;
  sectionName: string;
  sectionId: number;
  floorName: string;
  floorId: number;
  buildingName: string;
  buildingId: number;
  organizationName: string;
  organizationId: number;

  data: { key: string; value: string }[];
  limit?: Limit; // <-- Add this if it may or may not exist
}

export interface Limit {
  key: string;
  min: number;
  max: number;
}

export interface PaginatedDevices {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  meta: any;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  succeeded: boolean;
  data: Device[];
}

export interface Application {
  id: number;
  name: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  meta: any;
  succeeded: boolean;
  message: string;
  error: any;
  businessErrorCode: any;
  data: T;
}

export interface ToggleDevicePointPayload {
  id: number;
  deviceId: number;
  isActive: boolean;
  customName: string;
  customDescription: string;
  pointId: number | null; // ✅ allow null
}
