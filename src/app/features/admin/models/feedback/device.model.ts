// models/feedback/device.model.ts
export interface Device {
  id: number;
  name: string;
  sectionId: number;
  sectionName?: string;
  building?: string;
  floor?: string;
  feedback?: string;
  questionCount?: number;
}

export interface DeviceListResponse {
  succeeded: boolean;
  message: string;
  data: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    data: Device[];
  };
}

export interface DeviceResponse {
  succeeded: boolean;
  message: string;
  data: Device | null;
}
