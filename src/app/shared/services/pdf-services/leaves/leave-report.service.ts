// leave-report.service.ts
import { Injectable } from '@angular/core';
import { PdfCoverService } from '../general layout/pdf-cover.service';
import { PdfLayoutService } from '../general layout/pdf-layout.service';
import { LeaveChartService } from './leave-chart.service';
import { LeaveTableService } from './leave-table.service';
import { LeaveReportConfig } from '../models/leave-report.model';
import {
  LeaveHistoryItem,
  LeaveStatusData,
  LeaveTypeData,
} from './leave-report.model';
import jsPDF from 'jspdf';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LeaveReportService {
  private leaveStatusData: LeaveStatusData = {
    total: 100,
    pending: 15,
    approved: 60,
    rejected: 20,
    cancelled: 5,
  };

  private leaveTypeData: LeaveTypeData = {
    total: 100,
    annual: 45,
    sick: 30,
    casual: 25,
  };

  constructor(
    private cover: PdfCoverService,
    private layout: PdfLayoutService,
    private chart: LeaveChartService,
    private table: LeaveTableService
  ) {}

  generateLeavePDF(config: LeaveReportConfig): Observable<void> {
    const fullConfig = this.buildCompleteConfig(config);

    return this.fetchLeaveData().pipe(
      map((data) => this.createPDF(fullConfig, data)),
      catchError((err) => {
        console.error('Error generating PDF', err);
        throw err;
      })
    );
  }

  private buildCompleteConfig(config: LeaveReportConfig) {
    return {
      fileName: config.fileName || 'leave_report',
      pdfTitle: config.pdfTitle || 'Leave Report',
      includeCoverPage: config.includeCoverPage ?? true,
      reportInfo: {
        reportDate: config.reportInfo?.reportDate || new Date(),
        preparedBy: config.reportInfo?.preparedBy || 'Leave Management System',
        ...config.reportInfo,
      },
      headers: config.headers || this.table.defaultHeaders,
      data: config.data || [],
      columnKeys: config.columnKeys || this.table.defaultColumnKeys,
    };
  }

  private fetchLeaveData(): Observable<LeaveHistoryItem[]> {
    return of(this.getMockData());
  }

  private getMockData(): LeaveHistoryItem[] {
    return [
      {
        id: '1',
        userId: 'u1',
        userName: 'John Doe',
        leaveType: 'Annual',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        duration: '5 days',
        status: 'Approved',
        reason: 'Family vacation',
      },
      {
        id: '2',
        userId: 'u2',
        userName: 'Jane Smith',
        leaveType: 'Sick',
        startDate: '2024-01-16',
        endDate: '2024-01-17',
        duration: '2 days',
        status: 'Pending',
        reason: 'Medical appointment',
      },
    ];
  }

  private createPDF(config: any, data: LeaveHistoryItem[]): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

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

    // Charts
    const chartsY = startY + 20;
    this.chart.addStatusChart(doc, 8, chartsY, this.leaveStatusData);
    this.chart.addTypeChart(
      doc,
      pageWidth / 2 + 2,
      chartsY,
      this.leaveTypeData
    );

    // Table
    const tableY = chartsY + 70;
    this.table.addLeaveTable(doc, config, data, tableY, 8, pageWidth);

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

  updateChartData(statusData?: LeaveStatusData, typeData?: LeaveTypeData) {
    if (statusData) this.leaveStatusData = statusData;
    if (typeData) this.leaveTypeData = typeData;
  }
}
