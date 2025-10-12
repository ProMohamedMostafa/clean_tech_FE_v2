// Basic Building Interface (flat, like Organization)
export interface Building {
  id: number;
  name: string;
  previousName: string;
  organizationId: number;
  organizationName: string;
  cityId: number;
  cityName: string;
  areaId: number;
  areaName: string;
  countryName: string;
}

export interface BuildingUsersShifts {
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

// Pagination data for buildings
export interface BuildingPaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: Building[];
}

// Generic API response wrapper for buildings
export interface BuildingApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  message: string;
  error: string | null;
  businessErrorCode: string | null;
  data: T;
}

// Model used to create or edit a building
export interface CreateEditBuildingModel {
  id?: number;
  name: string;
  organizationId: number;
  number: string;
  description: string;
  cityId?: number;
  areaId?: number;
  userIds: number[];
  shiftIds: number[];
}

// --------- Nested tree model for detailed structure (optional) ---------

export interface BuildingTreeResponse {
  id: number;
  name: string;
  previousName: string;
  organizationId: number;
  organizationName: string;
  floors: Floor[];
}

export interface Floor {
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
