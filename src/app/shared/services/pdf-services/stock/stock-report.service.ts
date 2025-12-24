// stock-report.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { PdfCoverService } from '../general layout/pdf-cover.service';
import { PdfLayoutService } from '../general layout/pdf-layout.service';
import { StockChartService } from './stock-chart.service';
import { StockTableService } from './stock-table.service';
import { StockReportConfig } from '../models/stock-report.model';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { StockItem, StockCategoryData } from './stock-report.model';

@Injectable({ providedIn: 'root' })
export class StockReportService {
  private categoryData: StockCategoryData = {
    raw: 40,
    finished: 500,
    damaged: 10,
    plastic: 120,
    aluminum: 80,
  };

  constructor(
    private cover: PdfCoverService,
    private layout: PdfLayoutService,
    private chart: StockChartService,
    private table: StockTableService
  ) {}

  generateStockPDF(config: StockReportConfig): Observable<void> {
    const fullConfig = this.buildConfig(config);

    return this.fetchStockData(fullConfig).pipe(
      map((data) => this.createPDF(fullConfig, data)),
      catchError((err) => {
        console.error('Error generating Stock PDF', err);
        throw err;
      })
    );
  }

  private buildConfig(config: StockReportConfig) {
    return {
      fileName: config.fileName || 'stock_report',
      pdfTitle: config.pdfTitle || 'Stock Report',
      includeCoverPage: config.includeCoverPage ?? true,
      reportInfo: config.reportInfo || {
        reportDate: new Date(),
        preparedBy: 'Stock System',
      },
      headers: config.headers || this.table.defaultHeaders,
      columnKeys: config.columnKeys || this.table.defaultColumnKeys,
      data: config.data || [],
    };
  }

  private fetchStockData(config: any): Observable<StockItem[]> {
    return of(this.getMockData());
  }

  private getMockData(): StockItem[] {
    return [
      {
        itemName: 'Steel Rods',
        category: 'Raw',
        quantity: 100,
        unit: 'kg',
        status: 'In Stock',
        lastUpdated: '2025-12-20',
      },
      {
        itemName: 'Paint',
        category: 'Finished',
        quantity: 500,
        unit: 'L',
        status: 'Reserved',
        lastUpdated: '2025-12-18',
      },
      {
        itemName: 'Broken Glass',
        category: 'Damaged',
        quantity: 10,
        unit: 'pcs',
        status: 'Out of Stock',
        lastUpdated: '2025-12-15',
      },
    ];
  }

  private createPDF(config: any, data: StockItem[]): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 20;

    // ================= COVER =================
    if (config.includeCoverPage) {
      this.cover.addCover(
        doc,
        config,
        pageWidth,
        doc.internal.pageSize.getHeight()
      );
      doc.addPage();
    }

    // ================= CONTENT =================
    const fromDate = '01/12/2025'; // replace with dynamic start date if needed
    const toDate = '24/12/2025'; // replace with dynamic end date if needed

    const startY = this.layout.addHeader(
      doc,
      config.pdfTitle,
      pageWidth,
      fromDate,
      toDate
    );

    // Single horizontal bar chart
    this.chart.addCategoryBarChart(
      doc,
      marginX,
      startY + 10,
      pageWidth - 2 * marginX,
      60,
      this.categoryData
    );

    // Table below the chart
    const tableY = startY + 90;
    this.table.addStockTable(doc, config, data, tableY, marginX, pageWidth);

    // Apply header & footer to all pages after cover
    this.layout.applyHeaderFooterToAllPages(
      doc,
      config.pdfTitle,
      pageWidth,
      fromDate,
      toDate
    );

    doc.save(`${config.fileName}.pdf`);
  }

  updateChartData(categoryData?: StockCategoryData) {
    if (categoryData) this.categoryData = categoryData;
  }
}
