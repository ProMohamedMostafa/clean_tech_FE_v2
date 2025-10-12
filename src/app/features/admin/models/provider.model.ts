export interface Provider {
  name: string;
  id: number;
  createdAt: string; // You can use `Date` if you prefer to work with dates as Date objects
  updatedAt: string; // Same here, use `Date` if you want to convert it automatically
  isDeleted: boolean;
}

export interface ProviderResponse {
  statusCode: number;
  meta: any | null; // Assuming 'meta' is null or contains additional metadata, adjust as needed
  succeeded: boolean;
  message: string;
  error: any | null; // Adjust this if the error is structured differently
  data: Provider[]; // Array of provider objects
}
export interface ProviderRequest {
  id?: number;
  name: string;
}

export interface PaginatedProviderResponse {
  data: Provider[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

export interface Provider {
  id: number;
  name: string;
}
