// Represents a basic Area object with essential fields.
export interface Area {
  id: number; // Unique identifier of the area
  name: string; // Area name
  countryName: string; // Country associated with the area
}

export interface AreaUsers {
  id: number;
  name: string;
  countryName: string;
  users?: any[];
}

// Describes paginated response metadata and area records.
export interface AreaPaginationData {
  currentPage: number; // Current page number
  totalPages: number; // Total number of pages
  totalCount: number; // Total number of area records
  pageSize: number; // Number of records per page
  hasPreviousPage: boolean; // Indicates if there is a previous page
  hasNextPage: boolean; // Indicates if there is a next page
  data: Area[]; // Array of area records
}

// Generic API response wrapper used across area-related endpoints.
export interface AreaApiResponse<T> {
  statusCode: number; // HTTP-like status code from backend
  succeeded: boolean; // Indicates whether the operation was successful
  message: string; // Success or error message
  error: string | null; // Optional error message if the request failed
  businessErrorCode: string | null; // Optional business-specific error code
  data: T; // Generic data payload
}

// Used for creating or editing an area; can also include assigned users.
export interface CreateEditAreaModel {
  id?: number; // Optional ID, required for editing
  name: string; // Area name
  countryName: string; // Country the area belongs to
  userIds: number[]; // List of user IDs assigned to this area
}

// Full hierarchical response containing all nested structures within an area.
export interface AreaTreeResponse {
  id: number; // Area ID
  name: string; // Current name
  previousName: string; // Optional previous name
  cities: City[]; // Cities under the area
}

// Represents a city within an area.
export interface City {
  id: number; // City ID
  name: string; // Current name
  previousName: string; // Optional previous name
  organizations: Organization[]; // Organizations within the city
}

// Represents an organization within a city.
export interface Organization {
  id: number; // Organization ID
  name: string; // Current name
  previousName: string; // Optional previous name
  buildings: Building[]; // Buildings under this organization
}

// Represents a building within an organization.
export interface Building {
  id: number; // Building ID
  name: string; // Current name
  previousName: string; // Optional previous name
  floors: Floor[]; // Floors inside the building
}

// Represents a floor inside a building.
export interface Floor {
  id: number; // Floor ID
  name: string; // Current name
  previousName: string; // Optional previous name
  sections: Section[]; // Sections on this floor
}

// Represents a section within a floor.
export interface Section {
  id: number; // Section ID
  name: string; // Current name
  previousName: string; // Optional previous name
  points: Point[]; // Measurement or control points in this section
}

// Represents a point (e.g., a sensor or device) within a section.
export interface Point {
  id: number; // Point ID
  name: string; // Point name
  device: any; // Associated device object (can be typed further)
}

// Represents an area with all users currently assigned to it.
export interface AreaWithUsers {
  id: number; // Area ID
  name: string; // Area name
  countryName: string; // Country name
  users: {
    id: number; // User ID
    userName: string; // Username
    firstName: string; // User's first name
    lastName: string; // User's last name
    role: string; // User role (e.g., Manager, Admin)
    email: string; // Email address
    image: string | null; // Optional user profile image
  }[];
}
