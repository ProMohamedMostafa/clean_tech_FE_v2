export enum WorkLocationType {
  Country = 0,
  Area = 1,
  City = 2,
  Organization = 3,
  Building = 4,
  Floor = 5,
  Section = 6,
  Point = 7,
}

// ✅ Represents a single user entity and their personal & role information
export interface UserModel {
  id: number; // Unique user ID
  userName: string; // Username (used for login or display)
  firstName: string; // First name
  lastName: string; // Last name
  email: string; // Email address
  phoneNumber: string; // User's phone number
  image: string | null; // Profile image URL or null if not uploaded
  birthdate: string; // Date of birth (ISO string)
  managerId?: number | null; // ID of the user’s manager (nullable)
  managerName?: string | null; // Manager’s full name (nullable)
  idNumber: string; // National ID or employee ID
  nationalityName: string; // Nationality (e.g., Egyptian, Indian)
  countryName: string; // Country name
  providerId: number; // Linked provider ID (e.g., supplier or system)
  providerName: string | null; // Name of the provider (nullable)
  gender: string; // Gender as string (e.g., 'Male', 'Female')
  genderId: number; // Gender ID (usually 1 = Male, 2 = Female)
  role: string; // Role name (e.g., Admin, Member)
  roleId: number; // Role ID
  Type: WorkLocationType;
  ShiftIds: number[];
  TypeIds: number[];
}

// ✅ Represents paginated user data with metadata for pagination controls
export interface UserPaginationData {
  currentPage: number; // Current page number
  totalPages: number; // Total number of pages
  totalCount: number; // Total number of records available
  pageSize: number; // Number of users per page
  hasPreviousPage: boolean; // Whether there's a page before this one
  hasNextPage: boolean; // Whether there's a page after this one
  data: UserModel[]; // The actual array of user records
}

// ✅ Generic API response structure used for all user API endpoints
export interface UserApiResponse<T> {
  statusCode: number; // HTTP-like status code (e.g., 200, 400)
  succeeded: boolean; // Whether the API operation was successful
  message: string; // Descriptive message (e.g., "Success", "Not Found")
  error: string | null; // Error message (if any)
  data: T; // Actual returned data (generic type)
}

// ✅ Represents a simplified Area entity (used in work location data)
export interface UserArea {
  id: number; // Area ID
  name: string; // Area name
  countryName: string; // Country the area belongs to
}

// ✅ Represents a City with related area and country info
export interface UserCity {
  id: number; // City ID
  name: string; // City name
  areaId: number; // Parent area ID
  areaName: string; // Parent area name
  countryName: string; // Country name
}

export interface UserOrganization {
  id: number;
  name: string;
  cityId: number;
  cityName: string;
  areaId: number;
  areaName: string;
  countryName: string;
}

export interface UserBuilding {
  id: number;
  name: string;
  organizationId: number;
  organizationName: string;
  cityId: number;
  cityName: string;
  areaId: number;
  areaName: string;
  countryName: string;
}

export interface UserFloor {
  id: number;
  name: string;
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

export interface UserSection {
  id: number;
  name: string;
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

// ✅ Represents a full location point (most detailed unit in work structure)
export interface UserPoint {
  id: number; // Point ID
  name: string; // Point name
  number: string; // Point number (often same as name)
  description: string; // Description of the point
  isCountable: boolean; // Indicates if the point is used for counting (e.g., attendance)
  capacity: number | null; // Max capacity allowed (nullable)
  unit: string | null; // Unit of measurement (e.g., "persons")
  sectionId: number; // Parent section ID
  sectionName: string; // Section name
  floorId: number; // Parent floor ID
  floorName: string; // Floor name
  buildingId: number; // Parent building ID
  buildingName: string; // Building name
  organizationId: number; // Parent organization ID
  organizationName: string; // Organization name
  cityId: number; // Parent city ID
  cityName: string; // City name
  areaId: number; // Parent area ID
  areaName: string; // Area name
  countryName: string; // Country name
  deviceName: string | null; // Device name if linked (nullable)
  deviceId: number | null; // Device ID if linked (nullable)
  hasDevice: boolean; // Whether a device is attached to the point
}

// ✅ Full work location structure for a user — includes hierarchical info
export interface WorkLocationResponse {
  areas: UserArea[]; // List of areas the user is linked to
  cities: UserCity[]; // List of cities the user is linked to
  organizations: UserOrganization[]; // List of organizations (you can define this interface if needed)
  buildings: UserBuilding[]; // List of buildings
  floors: UserFloor[]; // List of floors
  sections: UserSection[]; // List of sections
  points: UserPoint[]; // List of detailed points (with full hierarchy)
}

export interface UserRole {
  id: number;
  name: string;
  label: string;
  value: string;
}

export interface UserNationality {
  id: number;
  name: string;
}
