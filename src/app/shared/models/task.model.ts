/**
 * Represents a user involved or assigned inside a task.
 */
export interface TaskUser {
  id: number; // Unique identifier of the user
  userName: string; // Username or login name
  firstName: string; // User's first name
  lastName: string; // User's last name
  role: string; // Role of the user (e.g., Admin, Member)
  email: string; // User's email address
  image: string; // URL or path to user's profile image
}

/**
 * Represents a single task item with full details.
 */
export interface TaskModel {
  id: number; // Unique identifier of the task
  title: string; // Title or brief summary of the task
  description: string; // Detailed description of the task
  priority: string; // Priority label (e.g., High, Medium, Low)
  priorityId: number; // Priority identifier (numeric)
  status: string; // Status label (e.g., Pending, Completed)
  statusId: number; // Status identifier (numeric)
  startDate: string; // Task start date (ISO string)
  endDate: string; // Task end date (ISO string)
  startTime: string; // Task start time (HH:mm format or ISO)
  endTime: string; // Task end time (HH:mm format or ISO)
  currentReading?: number | null; // Optional current reading or measurement related to the task
  readingAfter?: number | null; // Optional reading after task completion
  organizationName?: string | null; // Optional organization name related to task
  buildingName?: string | null; // Optional building name where the task is located
  floorName?: string | null; // Optional floor name or number
  sectionName?: string | null; // Optional section name within floor/building
  pointName?: string | null; // Optional specific point or location within section
  parentTitle?: string | null; // Optional title of parent task if this is a subtask
  createdBy: number; // ID of the user who created the task
  createdUserName: string; // Username of the creator
  started?: string | null; // Optional timestamp when the task was started
  duration?: string | null; // Optional duration of the task (e.g., "2h 30m")
  users: TaskUser[]; // List of users involved or assigned to this task
}

/**
 * Wrapper for paginated tasks response, including paging metadata.
 */
export interface TaskPaginationData {
  currentPage: number; // Current page number in pagination
  totalPages: number; // Total number of pages available
  totalCount: number; // Total number of task items available
  pageSize: number; // Number of tasks per page
  hasPreviousPage: boolean; // Indicates if there is a previous page available
  hasNextPage: boolean; // Indicates if there is a next page available
  data: TaskModel[]; // Array of tasks on the current page
}

/**
 * Generic structure for API responses wrapping data of type T.
 */
export interface TaskApiResponse<T> {
  statusCode: number; // HTTP status code returned by the API
  meta: any; // Optional metadata (pagination info, etc.)
  succeeded: boolean; // Indicates if the request was successful
  message: string; // Response message or status description
  error: any; // Error details if any occurred
  businessErrorCode: any; // Application-specific business error code, if any
  data: T; // Payload data returned by the API
}

/**
 * Filters and parameters used for paginated task retrieval.
 */
export interface TaskPaginationFilters {
  PageNumber?: number; // Page number to retrieve
  PageSize?: number; // Number of items per page
  SearchQuery?: string; // Text search query to filter tasks
  Status?: number; // Filter by status ID
  Priority?: number; // Filter by priority ID
  CreatedBy?: number; // Filter by user ID who created the task
  AreaId?: number; // Filter by area/location ID
  CityId?: number; // Filter by city ID
  OrganizationId?: number; // Filter by organization ID
  BuildingId?: number; // Filter by building ID
  FloorId?: number; // Filter by floor ID
  SectionId?: number; // Filter by section ID
  PointId?: number; // Filter by point ID
  AssignTo?: number; // Filter by assigned user ID
  ProviderId?: number; // Filter by provider ID (if applicable)
  StartDate?: string; // Filter tasks starting from this date (ISO string)
  EndDate?: string; // Filter tasks ending by this date (ISO string)
  StartTime?: string; // Filter tasks starting from this time
  EndTime?: string; // Filter tasks ending by this time
  DeviceId?: number; // Filter by device ID related to task (if any)
}

/**
 * Data structure representing the count of tasks by priority.
 */
export interface TaskPriorityData {
  High: number; // Number of tasks with High priority
  Medium: number; // Number of tasks with Medium priority
  Low: number; // Number of tasks with Low priority
}

/**
 * Data structure representing task statuses and their respective counts.
 */
export interface TaskStatusData {
  labels: string[]; // Array of status labels (e.g., Pending, Completed)
  values: number[]; // Corresponding counts for each status label
}

/**
 * Data structure representing task completion statistics over time.
 */
export interface TaskCompletionData {
  labels: string[]; // Array of time periods (e.g., months)
  values: number[]; // Completion percentages or counts for each period
}

export interface DropdownItem {
  id: number;
  name: string;
}

// models/task.model.ts

export interface Point extends DropdownItem {
  isCountable: boolean;
}

export enum TaskLevel {
  BUILDING = 'Building',
  FLOOR = 'Floor',
  SECTION = 'Section',
  POINT = 'Point',
}

export enum TaskPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

export enum TaskStatus {
  PENDING = 0,
  IN_PROGRESS = 1,
  COMPLETED = 3,
  NOT_RESOLVED = 5,
  OVERDUE = 6,
}

export interface DropdownItem {
  id: number;
  name: string;
}

export interface LocationHierarchy {
  organizations: DropdownItem[];
  buildings: DropdownItem[];
  floors: DropdownItem[];
  sections: DropdownItem[];
  points: any[];
}

// shared/models/task.model.ts
export interface DropdownItem {
  id: number;
  name: string;
  isCountable?: boolean;
}

export interface UploadedFile {
  name: string;
  size?: number;
  preview: string;
  file?: File;
  path?: string;
}

export enum TaskLevel {
  Building = 'Building',
  Floor = 'Floor',
  Section = 'Section',
  Point = 'Point',
}

export interface TaskResponse {
  statusCode: number;
  meta: any | null;
  succeeded: boolean;
  message: string;
  error: any | null;
  businessErrorCode: any | null;
  data: PaginatedTaskData;
}

export interface PaginatedTaskData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  meta: any | null;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  succeeded: boolean;
  data: Task[];
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  priorityId: number;
  status: string;
  statusId: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  currentReading: string | null;
  readingAfter: string | null;
  organizationName: string | null;
  buildingName: string | null;
  floorName: string | null;
  sectionName: string | null;
  pointName: string | null;
  parentTitle: string | null;
  createdBy: number;
  createdUserName: string;
  started: string | null;
  duration: string | null;
  users: User[];
}

export interface User {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  image: string | null;
}

export interface TaskFilters {
  pageNumber?: number;
  pageSize: number;
  search?: string;
  status?: number;
  priority?: number;
  created?: number;
  area?: number;
  city?: number;
  organization?: number;
  building?: number;
  floor?: number;
  section?: number;
  point?: number;
  assignTo?: number;
  provider?: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  DeviceId?: number;
}

export interface TaskCreateModel {
  sectionId?: number;
  priority?: number;
  parentId?: number;
  floorId?: number;
  endTime?: string;
  endDate?: string;
  pointId?: number;
  userIds?: number[]; // multiple users
  startTime?: string;
  buildingId?: number;
  startDate?: string;
  status?: number;
  currentReading?: number;
  files?: File[]; // optional files
  title?: string;
  description?: string;
  createdBy?: number;
}

export enum TaskStatus {
  Pending = 0,
  InProgress = 1,
  WaitingForApproval = 2,
  Completed = 3,
  Rejected = 4,
  NotResolved = 5,
  Overdue = 6,
}
