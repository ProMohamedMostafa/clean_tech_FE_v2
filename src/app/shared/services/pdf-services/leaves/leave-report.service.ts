// leave-report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PdfCoverService } from '../general layout/pdf-cover.service';
import { PdfLayoutService } from '../general layout/pdf-layout.service';
import { LeaveChartService } from './leave-chart.service';
import { LeaveTableService } from './leave-table.service';
import { LeaveReportConfig } from '../models/leave-report.model';
import { LeaveStatusData, LeaveTypeData } from './leave-report.model';
import jsPDF from 'jspdf';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LeaveReportService {
  private apiUrl = `${environment.apiUrl}/leaves/report`;

  private leaveStatusData: any = {
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
  };

  private leaveTypeData: any = {
    annual: 0,
    sick: 0,
    casual: 0,
    ordinary: 0,
  };

  constructor(
    private http: HttpClient,
    private cover: PdfCoverService,
    private layout: PdfLayoutService,
    private chart: LeaveChartService,
    private table: LeaveTableService
  ) {}

  generateLeavePDF(config: any): Observable<void> {
    const fullConfig = this.buildCompleteConfig(config);

    return this.fetchLeaveData(fullConfig).pipe(
      map((data) => {
        this.createPDF(fullConfig, data);
        return void 0;
      }),
      catchError((err) => {
        console.error('Error generating PDF', err);
        throw err;
      })
    );
  }

  private buildCompleteConfig(config: any): any {
    return {
      fileName:
        config.fileName ||
        `leave_report_${new Date().toISOString().split('T')[0]}`,
      pdfTitle: config.pdfTitle || 'Leave Report',
      includeCoverPage: config.includeCoverPage ?? true,
      reportInfo: {
        reportDate: config.reportInfo?.reportDate || new Date(),
        preparedBy: config.reportInfo?.preparedBy || 'Leave Management System',
        fromDate: config.startDate,
        toDate: config.endDate,
      },
      headers: config.headers || [
        'User',
        'Role',
        'Start Date',
        'End Date',
        'Type',
        'Status',
        'Reason',
        'Has File',
      ],
      columnKeys: config.columnKeys || [
        'userName',
        'role',
        'startDate',
        'endDate',
        'type',
        'status',
        'reason',
        'hasFile',
      ],
      data: config.data || [],
      // API parameters
      startDate: config.startDate,
      endDate: config.endDate,
      userId: config.userId,
      type: config.type,
      status: config.status,
    };
  }

  private fetchLeaveData(config: any): Observable<any> {
    // Build query parameters
    let params = new HttpParams();

    if (config.startDate) {
      params = params.set('StartDate', config.startDate);
    }
    if (config.endDate) {
      params = params.set('EndDate', config.endDate);
    }
    if (config.userId !== undefined && config.userId !== null) {
      params = params.set('UserId', config.userId.toString());
    }
    if (config.type !== undefined && config.type !== null) {
      params = params.set('Type', config.type.toString());
    }
    if (config.status !== undefined && config.status !== null) {
      params = params.set('Status', config.status.toString());
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch leave data');
        }

        // Transform API data to match expected formats
        this.transformChartData(response.data);

        return response.data;
      }),
      catchError((error) => {
        console.error('API Error:', error);
        // Return empty data structure on error
        return of({
          from: config.startDate || new Date().toISOString().split('T')[0],
          to: config.endDate || new Date().toISOString().split('T')[0],
          total: 0,
          status: { labels: [], values: [] },
          type: { labels: [], values: [] },
          leaves: [],
        });
      })
    );
  }

  private transformChartData(apiData: any): void {
    // Reset data
    this.leaveStatusData = {
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    };
    this.leaveTypeData = { annual: 0, sick: 0, casual: 0, ordinary: 0 };

    // Transform status data
    if (apiData.status?.labels && apiData.status?.values) {
      apiData.status.labels.forEach((label: string, index: number) => {
        const value = apiData.status.values[index] || 0;
        const normalizedLabel = label.toLowerCase().trim();

        switch (normalizedLabel) {
          case 'pending':
            this.leaveStatusData.pending = value;
            break;
          case 'approved':
            this.leaveStatusData.approved = value;
            break;
          case 'rejected':
            this.leaveStatusData.rejected = value;
            break;
          case 'cancelled':
            this.leaveStatusData.cancelled = value;
            break;
        }
      });
    }

    // Transform type data
    if (apiData.type?.labels && apiData.type?.values) {
      apiData.type.labels.forEach((label: string, index: number) => {
        const value = apiData.type.values[index] || 0;
        const normalizedLabel = label.toLowerCase().trim();

        switch (normalizedLabel) {
          case 'annual':
            this.leaveTypeData.annual = value;
            break;
          case 'sick':
            this.leaveTypeData.sick = value;
            break;
          case 'casual':
            this.leaveTypeData.casual = value;
            break;
          case 'ordinary':
            this.leaveTypeData.ordinary = value;
            break;
        }
      });
    }
  }

  private createPDF(config: any, apiData: any): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 8;

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
          title: config.pdfTitle || 'Leave Report',
          fromDate: fromDateDisplay,
          toDate: toDateDisplay,
        },
      };

      this.cover.addCover(
        doc,
        coverConfig,
        pageWidth,
        doc.internal.pageSize.getHeight()
      );
      doc.addPage();
    }

    // ================= CONTENT =================
    const startY = this.layout.addHeader(
      doc,
      config.pdfTitle || 'Leave Report',
      pageWidth,
      fromDateDisplay,
      toDateDisplay
    );

    // Charts
    const chartsY = startY + 30;
    this.chart.addStatusChart(doc, marginX, 30, this.leaveStatusData);
    this.chart.addTypeChart(
      doc,
      pageWidth / 2 + 2,
      30,
      this.leaveTypeData
    );

    // Table
    const tableY = chartsY + 40;
    const tableData = apiData.leaves || config.data || [];

    if (tableData.length > 0) {
      this.table.addLeaveTable(
        doc,
        config,
        tableData,
        tableY,
        marginX,
        pageWidth
      );
    } else {
      // Show "No data" message if no leaves
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('No leaves found for the selected criteria', marginX, tableY);
    }

    // Apply header & footer to all pages after cover
    this.layout.applyHeaderFooterToAllPages(
      doc,
      config.pdfTitle || 'Leave Report',
      pageWidth,
      fromDateDisplay,
      toDateDisplay
    );

    doc.save(`${config.fileName}.pdf`);
  }

  updateChartData(statusData?: LeaveStatusData, typeData?: LeaveTypeData) {
    if (statusData) this.leaveStatusData = statusData;
    if (typeData) this.leaveTypeData = typeData;
  }
}
