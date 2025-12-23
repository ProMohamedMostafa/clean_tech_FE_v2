import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { PdfCoverService } from '../general layout/pdf-cover.service';
import { PdfLayoutService } from '../general layout/pdf-layout.service';
import { TransactionChartService } from './transaction-chart.service';
import { TransactionTableService } from './transaction-table.service';
import { TransactionReportConfig } from '../models/transaction-report.model';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  TransactionHistoryItem,
  TransactionTypeData,
  TransactionStatusData,
} from './transaction-report.model';

@Injectable({ providedIn: 'root' })
export class TransactionReportService {
  private typeData: TransactionTypeData = {
    income: 50,
    expense: 30,
    transfer: 20,
  };

  private statusData: TransactionStatusData = {
    pending: 10,
    completed: 80,
    failed: 10,
  };

  constructor(
    private cover: PdfCoverService,
    private layout: PdfLayoutService,
    private chart: TransactionChartService,
    private table: TransactionTableService
  ) {}

  generateTransactionPDF(config: TransactionReportConfig): Observable<void> {
    const fullConfig = this.buildConfig(config);

    return this.fetchTransactionData().pipe(
      map((data) => this.createPDF(fullConfig, data)),
      catchError((err) => {
        console.error('Error generating Transaction PDF', err);
        throw err;
      })
    );
  }

  private buildConfig(config: TransactionReportConfig) {
    return {
      fileName: config.fileName || 'transaction_report',
      pdfTitle: config.pdfTitle || 'Transaction Report',
      includeCoverPage: config.includeCoverPage ?? true,
      reportInfo: config.reportInfo || {
        reportDate: new Date(),
        preparedBy: 'Transaction System',
      },
      headers: config.headers || this.table.defaultHeaders,
      columnKeys: config.columnKeys || this.table.defaultColumnKeys,
      data: config.data || [],
    };
  }

  private fetchTransactionData(): Observable<TransactionHistoryItem[]> {
    return of(this.getMockData());
  }

  private getMockData(): TransactionHistoryItem[] {
    return [
      {
        id: 'T001',
        date: '2025-12-01',
        type: 'Income',
        amount: 500,
        status: 'Completed',
        description: 'Client payment',
      },
      {
        id: 'T002',
        date: '2025-12-02',
        type: 'Expense',
        amount: 200,
        status: 'Pending',
        description: 'Office supplies',
      },
      {
        id: 'T003',
        date: '2025-12-03',
        type: 'Transfer',
        amount: 300,
        status: 'Failed',
        description: 'Bank transfer',
      },
    ];
  }

  private createPDF(config: any, data: TransactionHistoryItem[]): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 10;

    if (config.includeCoverPage) {
      this.cover.addCover(
        doc,
        config,
        pageWidth,
        doc.internal.pageSize.getHeight()
      );
      doc.addPage();
    }

    const startY = this.layout.addHeader(doc, config.pdfTitle, pageWidth);
    this.layout.addMetadata(doc, config, pageWidth, startY);

    /** Grouped bar chart data */
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const quantities = [120, 90, 150, 110, 130, 170];
    const costs = [500, 420, 610, 480, 530, 700];

    this.chart.addMonthlyGroupedBarChart(
      doc,
      startY + 15,
      months,
      quantities,
      costs
    );

    this.table.addTransactionTable(
      doc,
      config,
      data,
      startY + 160,
      marginX,
      pageWidth
    );

    doc.save(`${config.fileName}.pdf`);
  }

  updateChartData(
    typeData?: TransactionTypeData,
    statusData?: TransactionStatusData
  ) {
    if (typeData) this.typeData = typeData;
    if (statusData) this.statusData = statusData;
  }
}
