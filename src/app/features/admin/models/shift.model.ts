// src/app/core/models/shift/shift.model.ts

// Represents a basic Shift model
export interface Shift {
  id: number;
  name: string;
  startDate: string; // format: YYYY-MM-DD
  endDate: string; // format: YYYY-MM-DD
  startTime: string; // format: HH:mm:ss
  endTime: string; // format: HH:mm:ss
}

// Generic Paginated Data interface for handling paginated responses
export interface PaginatedData<T> {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  meta: any; // Can be defined more specifically if needed
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  succeeded: boolean;
  data: T[]; // Data of type T, could be an array of any model
}

// Standard API response model with Paginated Data
export interface ApiResponse<T> {
  statusCode: number;
  meta: any; // Can be defined more specifically if needed
  succeeded: boolean;
  message: string;
  error: any; // Error details, if any
  businessErrorCode: any; // Business error code, if applicable
  data: PaginatedData<T>; // Contains paginated data
}

// Request model for creating or editing a shift

// src/app/core/models/shift/shift-detail.model.ts

// Detailed response for a single shift, including related organizations and other entities
export interface ShiftDetailResponse {
  id: number;
  name: string;
  startDate: string; // e.g., "2025-05-07"
  endDate: string;
  startTime: string; // e.g., "08:39:00"
  endTime: string;

  organizations: any[]; // Can be defined more specifically (e.g., Organization model)

  building: any[]; // Define specific types if needed
  floors: any[];
  sections: any[];
}

// src/app/core/models/shift/deleted-shift.model.ts

// Model for deleted shifts, including shift details
export interface DeletedShift {
  id: number;
  name: string;
  startDate: string; // format: YYYY-MM-DD
  endDate: string; // format: YYYY-MM-DD
  startTime: string; // format: HH:mm:ss
  endTime: string; // format: HH:mm:ss
}

// Response for deleted shifts
export interface DeletedShiftsResponse {
  statusCode: number;
  meta: any; // Define meta data if needed
  succeeded: boolean;
  message: string;
  error: any; // Error details if any
  businessErrorCode: any; // Business error code if applicable
  data: DeletedShift[]; // Array of deleted shifts
}

export interface DropdownItem {
  id: number;
  name: string;
}

export interface Shift {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  organizations?: DropdownItem[];
  building?: DropdownItem[];
  floors?: DropdownItem[];
  sections?: DropdownItem[];
}

export interface ShiftCreateOrEditRequest {
  id?: number;
  name: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  organizationIds: number[];
  buildingIds: number[];
  floorIds: number[];
  sectionIds: number[];
}

export interface ShiftDetailResponse {
  data: Shift;
}

export enum HierarchyLevel {
  ORGANIZATION = 'Organization',
  BUILDING = 'Building',
  FLOOR = 'Floor',
  SECTION = 'Section',
}

export interface ShiftFormData {
  id: number | null;
  name: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface HierarchySelection {
  selectedLevel: HierarchyLevel | null;
  selectedOrganization: number | null;
  selectedBuilding: number | null;
  selectedFloor: number | null;
  selectedSection: number | null;
}
