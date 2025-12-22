// pdf/models/attendance-report.model.ts

export type FontType = 'helvetica' | 'times' | 'courier';
export type ColorTuple = [number, number, number];

export interface AttendanceReportConfig {
  fileName: string;
  headers: string[];
  data: any[];

  columnKeys?: string[];
  columnFormatter?: (data: any) => any[];

  pdfTitle?: string;

  companyInfo?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };

  reportInfo?: {
    reportDate?: Date;
    reportId?: string;
    preparedBy?: string;
    period?: string;
    description?: string;
  };

  styling?: {
    primaryColor?: ColorTuple;
    secondaryColor?: ColorTuple;
    headerFontSize?: number;
    bodyFontSize?: number;
    font?: FontType;
  };

  includeCoverPage?: boolean;

  coverPageConfig?: {
    title?: string;
    subtitle?: string;
    preparedFor?: string;
    confidentiality?: string;
    version?: string;
    includeToc?: boolean;
    footerText?: string;
  };
}
