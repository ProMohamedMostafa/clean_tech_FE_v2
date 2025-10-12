// Point Model Interfaces
export interface Point {
  id: number;
  name: string;
  number: string;
  description: string;
  sectionId: number;
  sectionName: string;
  floorId: number;
  floorName: string;
  buildingId: number;
  buildingName: string;
  organizationId: number;
  organizationName: string;
  deviceId?: number;
  deviceName?: string;
}

export interface PointUsers {
  id: number;
  name: string;
  number: string;
  description: string;
  isCountable: boolean;
  capacity: number | null;
  unit: string | null;
  unitId: number | null;
  sectionId: number;
  sectionName: string;
  floorId: number;
  floorName: string;
  buildingId: number;
  buildingName: string;
  organizationId: number;
  organizationName: string;
  cityId: number;
  cityName: string;
  areaId: number;
  areaName: string;
  countryName: string;
  deviceId?: number; // Add this
  deviceName?: string; // Add this
  hasDevice?: boolean; // Add this
  users: any[];
}

// Pagination data for points
export interface PointPaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: Point[];
}

// Generic API response wrapper for points
export interface PointApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  message: string;
  error: string | null;
  businessErrorCode: string | null;
  data: T;
}

// Model used to create or edit a point
export interface CreateEditPointModel {
  id?: number;
  name: string;
  number: string;
  description: string;
  sectionId: number;
  deviceId?: number;
  userIds: number[];
}
