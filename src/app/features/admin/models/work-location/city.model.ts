// يمثل مدينة مع الحقول الأساسية
export interface City {
  id: number;
  name: string;
  areaId: number;
  areaName: string;
  countryName: string;
}

export interface CityUsers {
  id: number;
  name: string;
  areaId: number;
  areaName?: string;
  countryName: string;
  users?: any[];
}

// بيانات الصفحة المرقمة للمدن
export interface CityPaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: City[];
}

// رد API عام للمدن
export interface CityApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  message: string;
  error: string | null;
  businessErrorCode: string | null;
  data: T;
}

// نموذج إنشاء أو تعديل المدينة
export interface CreateEditCityModel {
  id?: number;
  name: string;
  areaId: number;
  userIds: number[];
}

// نموذج مدينة مع المستخدمين المعينين لها
export interface CityWithUsers {
  id: number;
  name: string;
  areaId: number;
  areaName: string;
  countryName: string;
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

// الهيكل الهرمي الكامل للمدينة (شجرة المدينة)

export interface CityTreeResponse {
  id: number;
  name: string;
  previousName: string;
  areaId: number;
  areaName: string;
  countryName: string;
  organizations: Organization[];
}

export interface Organization {
  id: number;
  name: string;
  previousName: string;
  cityId: number;
  cityName: string;
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
  device: any; // يمكن تحديد نوع الجهاز حسب الحاجة
}
