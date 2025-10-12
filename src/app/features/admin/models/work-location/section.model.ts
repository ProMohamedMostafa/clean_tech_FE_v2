// Basic Section Interface (flat like Building and Floor)
export interface Section {
  id: number;
  name: string;
  number: string;
  description: string;
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
}

export interface SectionUsersShifts {
  id: number;
  name: string;
  number: string;
  description: string;
  floorId: number;
  floorName?: string;
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

// Pagination data for sections
export interface SectionPaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: Section[];
}

// Generic API response wrapper for sections
export interface SectionApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  message: string;
  error: string | null;
  businessErrorCode: string | null;
  data: T;
}

// Model used to create or edit a section
export interface CreateEditSectionModel {
  id?: number;
  name: string;
  number: string;
  description: string;
  floorId: number;
  userIds: number[];
  shiftIds: number[];
}

export interface SectionTreeResponse {
  id: number;
  name: string;
  number: string;
  description: string;
  floorId: number;
  floorName: string;
  buildingId: number;
  buildingName: string;
  organizationId: number;
  organizationName: string;
  points: Point[];
}

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
  cityId: number;
  cityName: string;
  areaId: number;
  areaName: string;
  countryName: string;
  device: any; // Replace 'any' with proper Device interface if available
}
