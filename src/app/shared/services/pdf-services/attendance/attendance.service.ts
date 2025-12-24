// attendance-report.service.ts
import { Injectable } from '@angular/core';
import { PdfCoverService } from '../general layout/pdf-cover.service';
import { PdfLayoutService } from '../general layout/pdf-layout.service';
import { AttendanceChartService } from './attendance-chart.service';
import { AttendanceTableService } from './attendance-table.service';
import { AttendanceReportConfig } from '../models/attendance-report.model';
import {
  AttendanceHistoryItem,
  TaskStatusData,
} from './attendance-report.model';
import jsPDF from 'jspdf';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AttendanceReportService {
  private taskStatusData: TaskStatusData = {
    total: 100,
    pending: 10,
    inProgress: 40,
    completed: 45,
    notResolved: 5,
  };

  constructor(
    private cover: PdfCoverService,
    private layout: PdfLayoutService,
    private chart: AttendanceChartService,
    private table: AttendanceTableService
  ) {}

  generateAttendancePDF(config: AttendanceReportConfig): Observable<void> {
    const fullConfig = this.buildCompleteConfig(config);

    return this.fetchAttendanceData(fullConfig).pipe(
      map((data) => this.createPDF(fullConfig, data)),
      catchError((err) => {
        console.error('Error generating PDF', err);
        throw err;
      })
    );
  }

  private buildCompleteConfig(config: AttendanceReportConfig) {
    return {
      fileName: config.fileName || 'attendance_report',
      pdfTitle: config.pdfTitle || 'Attendance Report',
      includeCoverPage: config.includeCoverPage ?? true,
      reportInfo: {
        reportDate: config.reportInfo?.reportDate || new Date(),
        preparedBy: config.reportInfo?.preparedBy || 'Attendance System',
        ...config.reportInfo,
      },
      headers: config.headers || this.table.defaultHeaders,
      data: config.data || [],
      columnKeys: config.columnKeys || this.table.defaultColumnKeys,
      columnFormatter: config.columnFormatter || ((data) => data),
    };
  }

  private fetchAttendanceData(
    config: any
  ): Observable<AttendanceHistoryItem[]> {
    return of(this.getMockData());
  }

  private getMockData(): AttendanceHistoryItem[] {
    return [
      {
        id: '1',
        userId: 'u1',
        userName: 'John Doe',
        role: 'Cleaner',
        date: '2024-01-15',
        clockIn: '08:00',
        clockOut: '17:00',
        duration: '9h',
        status: 'Present',
        shiftName: 'Morning',
      },
      {
        id: '2',
        userId: 'u2',
        userName: 'Jane Smith',
        role: 'Supervisor',
        date: '2024-01-15',
        clockIn: '09:00',
        clockOut: '18:00',
        duration: '9h',
        status: 'Present',
        shiftName: 'Day',
      },
      // Add more mock data as needed
    ];
  }

  private createPDF(config: any, data: AttendanceHistoryItem[]): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 5;
    const contentStartY = this.layout.HEADER_HEIGHT + 10;

    // ================= COVER =================
    if (config.includeCoverPage) {
      this.cover.addCover(doc, config, pageWidth, pageHeight);
      doc.addPage();
    }

    // ================= CONTENT =================
    // Set the date range here
    const fromDate = '01/12/2025'; // replace with actual start date
    const toDate = '24/12/2025'; // replace with actual end date

    // Draw header with title and date range
    this.layout.addHeader(doc, config.pdfTitle, pageWidth, fromDate, toDate);

    // Charts
    const chartHeight = 80;
    const chartSpacing = 10;
    const contentWidth = pageWidth - marginX * 2;
    const pieWidth = contentWidth / 3;
    const lineWidth = contentWidth - pieWidth - chartSpacing;
    const chartY = contentStartY + 10;

    this.chart.addStatusChart(doc, marginX, chartY, this.taskStatusData);
    this.chart.addMonthlyLineChart(
      doc,
      marginX + pieWidth + chartSpacing,
      chartY,
      lineWidth,
      chartHeight,
      [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      [50, 70, 65, 80, 90, 75, 60, 85, 95, 70, 55, 80]
    );

    // Table
    const tableY = chartY + chartHeight + 20;
    this.table.addAttendanceTable(
      doc,
      config,
      data,
      tableY,
      marginX,
      pageWidth
    );

    // ================= APPLY HEADER & FOOTER =================
    this.layout.applyHeaderFooterToAllPages(
      doc,
      config.pdfTitle,
      pageWidth,
      fromDate,
      toDate
    );

    doc.save(`${config.fileName}.pdf`);
  }

  updateChartData(statusData?: TaskStatusData) {
    if (statusData) this.taskStatusData = statusData;
  }
}
