export interface StockItem {
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  status: string;
  lastUpdated: string;
}

export interface StockCategoryData {
  [categoryName: string]: number; // dynamic category names
}

export interface StockStatusData {
  inStock: number;
  outOfStock: number;
  reserved: number;
}

export interface StockReportConfig {
  fileName?: string;
  pdfTitle?: string;
  includeCoverPage?: boolean;
  reportInfo?: { reportDate: Date; preparedBy: string };
  headers?: string[];
  columnKeys?: string[];
  data?: StockItem[];
}
