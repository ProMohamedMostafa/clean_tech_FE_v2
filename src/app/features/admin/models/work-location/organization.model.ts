export interface Organization {
  id: number;
  name: string;
  cityId: number;
  cityName: string;
  areaId: number;
  areaName: string;
  countryName: string;
}

export interface OrganizationUsersShifts {
  id: number;
  name: string;
  number: string;
  description: string;
  cityId: number;
  cityName?: string;
  areaId: number;
  areaName?: string;
  countryName: string;
  users?: any[];
  shifts?: any[];
}

// بيانات الصفحة المرقمة للمنظمات
export interface OrganizationPaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: Organization[];
}

// رد API عام للمنظمات
export interface OrganizationApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  message: string;
  error: string | null;
  businessErrorCode: string | null;
  data: T;
}

// نموذج إنشاء أو تعديل منظمة
export interface CreateEditOrganizationModel {
  id?: number;
  name: string;
  cityId: number;
  
  userIds: number[];
  shiftIds: number[];
}

// منظمة مع المستخدمين
export interface OrganizationWithUsers {
  id: number;
  name: string;
  cityId: number;
  cityName: string;
  users: {
    id: number;
    userName: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    image: string | null;
  }[];
}

export interface OrganizationTreeResponse {
  id: number;
  name: string;
  previousName: string;
  buildings: Building[];
}

export interface Building {
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
  device: any; // you can replace 'any' with a concrete Device interface if available
}
