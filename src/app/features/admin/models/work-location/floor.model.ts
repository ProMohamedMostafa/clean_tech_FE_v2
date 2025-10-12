// Floor Model Interfaces
export interface Floor {
  id: number;
  name: string;
  number: string;
  description: string;
  buildingId: number;
  buildingName: string;
  organizationId: number;
  organizationName: string;
  cityId: number;
  cityName: string;
  areaId: number;
  areaName: string;
  countryName: string;
}

export interface FloorUsersShifts {
  id: number;
  name: string;
  number: string;
  description: string;
  buildingId: number;
  buildingName?: string;
  organizationId: number;
  organizationName?: string;
  cityId: number;
  cityName?: string;
  areaId: number;
  areaName?: string;
  countryName: string;
  users?: any[];
  shifts?: any[];
}

// Pagination data for floors
export interface FloorPaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: Floor[];
}

// Generic API response wrapper for floors
export interface FloorApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  message: string;
  error: string | null;
  businessErrorCode: string | null;
  data: T;
}

// Model used to create or edit a floor
export interface CreateEditFloorModel {
  id?: number;
  name: string;
  number: string;
  description: string;
  buildingId: number;
  userIds: number[];
  shiftIds: number[];
}

// --------- Nested tree model for detailed structure (optional) ---------
export interface FloorTreeResponse {
  id: number;
  name: string;
  previousName: string;
  buildingId: number;
  buildingName: string;
  sections: Section[];
}

export interface Section {
  id: number;
  name: string;
  previousName: string;
  floorId: number;
  floorName: string;
  points: Point[];
}

export interface Point {
  id: number;
  name: string;
  sectionId: number;
  sectionName: string;
  device: any; // Replace with actual Device interface if available
}
