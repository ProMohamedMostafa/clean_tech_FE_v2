import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import jsPDF from 'jspdf';
import { PdfCoverService } from '../general layout/pdf-cover.service';
import { PdfLayoutService } from '../general layout/pdf-layout.service';
import { StockChartService } from './stock-chart.service';
import { StockTableService } from './stock-table.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

export interface StockChartData {
  labels: string[];
  values: number[];
}

export interface StockLogItem {
  id: number;
  name: string;
  category: string;
  userName: string;
  createdAt: string;
  provider: string;
  quantity: number;
  price: number;
  totalPrice: number;
  hasFile: boolean;
}

export interface StockReportData {
  from: string;
  to: string;
  material: string | null;
  totalQuantity: number;
  totalPrice: number;
  chart: StockChartData;
  logs: StockLogItem[];
}

export interface StockReportConfig {
  fileName?: string;
  pdfTitle?: string;
  includeCoverPage?: boolean;
  reportInfo?: {
    reportDate?: Date;
    preparedBy?: string;
    fromDate?: string;
    toDate?: string;
  };
  headers?: string[];
  columnKeys?: string[];
  data?: any[];
  // API parameters
  startDate?: string;
  endDate?: string;
  materialId?: number;
}

@Injectable({ providedIn: 'root' })
export class StockReportService {
  private apiUrl = `${environment.apiUrl}/stock/report`;

  private chartData: StockChartData = {
    labels: [],
    values: [],
  };

  constructor(
    private http: HttpClient,
    private cover: PdfCoverService,
    private layout: PdfLayoutService,
    private chart: StockChartService,
    private table: StockTableService
  ) {}

  generateStockPDF(config: StockReportConfig): Observable<void> {
    const fullConfig = this.buildCompleteConfig(config);

    return this.fetchStockData(fullConfig).pipe(
      map((data) => {
        this.createPDF(fullConfig, data);
        return void 0;
      }),
      catchError((err) => {
        console.error('Error generating Stock PDF', err);
        throw err;
      })
    );
  }

  private buildCompleteConfig(config: StockReportConfig): StockReportConfig {
    return {
      fileName:
        config.fileName ||
        `stock_report_${new Date().toISOString().split('T')[0]}`,
      pdfTitle: config.pdfTitle || 'Stock Report',
      includeCoverPage: config.includeCoverPage ?? true,
      reportInfo: {
        reportDate: config.reportInfo?.reportDate || new Date(),
        preparedBy: config.reportInfo?.preparedBy || 'Stock Management System',
        fromDate: config.startDate,
        toDate: config.endDate,
      },
      headers: config.headers || [
        'Item Name',
        'Category',
        'User',
        'Date',
        'Provider',
        'Quantity',
        'Price',
        'Total',
        'Has File',
      ],
      columnKeys: config.columnKeys || [
        'name',
        'category',
        'userName',
        'createdAt',
        'provider',
        'quantity',
        'price',
        'totalPrice',
        'hasFile',
      ],
      data: config.data || [],
      // API parameters
      startDate: config.startDate,
      endDate: config.endDate,
      materialId: config.materialId,
    };
  }

  private fetchStockData(
    config: StockReportConfig
  ): Observable<StockReportData> {
    // Build query parameters
    let params = new HttpParams();

    if (config.startDate) {
      params = params.set('StartDate', config.startDate);
    }
    if (config.endDate) {
      params = params.set('EndDate', config.endDate);
    }
    if (config.materialId !== undefined && config.materialId !== null) {
      params = params.set('MaterialId', config.materialId.toString());
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch stock data');
        }

        // Transform API data
        this.transformChartData(response.data);

        return response.data;
      }),
      catchError((error) => {
        console.error('API Error:', error);
        // Return empty data structure on error
        return of({
          from: config.startDate || new Date().toISOString().split('T')[0],
          to: config.endDate || new Date().toISOString().split('T')[0],
          material: null,
          totalQuantity: 0,
          totalPrice: 0,
          chart: { labels: [], values: [] },
          logs: [],
        });
      })
    );
  }

  private transformChartData(apiData: StockReportData): void {
    // Reset data
    this.chartData = {
      labels: [],
      values: [],
    };

    // Transform chart data
    if (apiData.chart?.labels && apiData.chart?.values) {
      this.chartData = {
        labels: apiData.chart.labels,
        values: apiData.chart.values,
      };
    }
  }

  private createPDF(config: StockReportConfig, apiData: StockReportData): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 15;

    // Format dates for display
    const formatDateForDisplay = (dateStr: string) => {
      if (!dateStr || dateStr === 'N/A') return dateStr;
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } catch {
        return dateStr;
      }
    };

    const fromDate = apiData.from || config.startDate || 'N/A';
    const toDate = apiData.to || config.endDate || 'N/A';

    const fromDateDisplay = formatDateForDisplay(fromDate);
    const toDateDisplay = formatDateForDisplay(toDate);

    // Format table data
    const formatTableData = (logs: StockLogItem[]) => {
      return logs.map((log) => ({
        ...log,
        createdAt: formatDateForDisplay(log.createdAt),
        price: `$${log.price.toFixed(2)}`,
        totalPrice: `$${log.totalPrice.toFixed(2)}`,
        hasFile: log.hasFile ? 'Yes' : 'No',
      }));
    };

    // ================= COVER =================
    if (config.includeCoverPage) {
      const coverConfig = {
        ...config,
        reportInfo: {
          ...config.reportInfo,
          fromDate: fromDateDisplay,
          toDate: toDateDisplay,
        },
        coverPageConfig: {
          title: config.pdfTitle || 'Stock Report',
          fromDate: fromDateDisplay,
          toDate: toDateDisplay,
        },
      };

      this.cover.addCover(doc, coverConfig, pageWidth, pageHeight);
      doc.addPage();
    }

    // ================= CONTENT =================
    const startY = this.layout.addHeader(
      doc,
      config.pdfTitle || 'Stock Report',
      pageWidth,
      fromDateDisplay,
      toDateDisplay
    );

    // Chart Section - Starting right after header
    const chartY = startY + 5;
    const chartHeight = 80;
    const chartWidth = pageWidth - 2 * marginX;

    // Calculate needed width for labels to prevent overflow
    // Find the longest label to determine extra width needed
    let maxLabelWidth = 0;
    if (this.chartData.labels && this.chartData.labels.length > 0) {
      doc.setFontSize(9);
      this.chartData.labels.forEach((label) => {
        // Approximate text width (1mm per character is a rough estimate)
        const approxWidth = label.length * 1.5;
        maxLabelWidth = Math.max(maxLabelWidth, approxWidth);
      });
    }

    // Adjust chart width to accommodate labels
    const adjustedChartWidth = chartWidth + maxLabelWidth + 5; // Add extra space for labels

    // Chart container - wider to accommodate labels
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(
      10,
      chartY,
      adjustedChartWidth,
      chartHeight + 20,
      3,
      3,
      'F'
    );

    // Chart border
    doc.setDrawColor(220, 223, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect(
      10,
      chartY,
      adjustedChartWidth,
      chartHeight + 20,
      3,
      3,
      'S'
    );

    // Chart title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Stock Value by Month', pageWidth / 2, chartY + 10, {
      align: 'center',
    });

    // Draw the chart with adjusted width for labels
    this.chart.addCategoryBarChart(
      doc,
      marginX + maxLabelWidth + 5, // Start position accounting for label space
      chartY + 15,
      chartWidth - maxLabelWidth - 15, // Adjusted width for chart area only
      chartHeight,
      this.chartData,
      '' // Empty title since we already have one above
    );

    // Table Section
    const tableY = chartY + chartHeight + 30; // Spacing after chart



    const tableData = formatTableData(apiData.logs || config.data || []);

    if (tableData.length > 0) {
      this.table.addStockTable(
        doc,
        config,
        tableData,
        tableY,
        marginX,
        pageWidth
      );
    } else {
      // Show "No data" message
      doc.setFillColor(252, 248, 242);
      doc.roundedRect(marginX, tableY, pageWidth - 2 * marginX, 25, 3, 3, 'F');

      doc.setDrawColor(250, 230, 210);
      doc.setLineWidth(0.5);
      doc.roundedRect(marginX, tableY, pageWidth - 2 * marginX, 25, 3, 3, 'S');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(180, 120, 60);
      doc.text(
        'No stock logs found for the selected criteria',
        pageWidth / 2,
        tableY + 13,
        { align: 'center' }
      );
    }

    // Apply header & footer to all pages after cover
    this.layout.applyHeaderFooterToAllPages(
      doc,
      config.pdfTitle || 'Stock Report',
      pageWidth,
      fromDateDisplay,
      toDateDisplay
    );

    doc.save(`${config.fileName}.pdf`);
  }

  updateChartData(chartData: StockChartData) {
    this.chartData = chartData;
  }
}
