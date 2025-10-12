export interface FeedbackDevice {
  id: number;
  name: string;

  sectionId: number;
  sectionName: string;

  floorId: number;
  floorName: string;

  buildingId: number;
  buildingName: string;

  organizationId: number;
  organizationName: string;
  type: number;
}

export interface FeedbackDeviceResponse {
  succeeded: boolean;
  message?: string;
  error?: any;
  data?: FeedbackDevice;
}

export interface FeedbackDeviceListResponse {
  succeeded: boolean;
  message?: string;
  error?: any;
  data?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    data: FeedbackDevice[];
  };
}



// //////////////////////////////////////////////////////////////////////

export interface Choice {
  id: number;
  text: string | null;
  image: string | null;
  icon: string | null;
}

export interface SectionQuestion {
  id: number;
  text: string;
  type: string;
  typeId: number;
  isChecked: boolean;
  choices: Choice[];
}

export interface SectionQuestionListResponse {
  statusCode: number;
  meta: any;
  succeeded: boolean;
  message: string;
  error: any;
  businessErrorCode: any;
  data: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    meta: any;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    succeeded: boolean;
    data: SectionQuestion[];
  };
}
