import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { PdfCoverService } from '../general layout/pdf-cover.service';
import { PdfLayoutService } from '../general layout/pdf-layout.service';
import { TaskChartService } from './task-chart.service';
import { TaskTableService } from './task-table.service';
import { TaskReportConfig } from '../models/task-report.model';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  TaskHistoryItem,
  TaskStatusData,
  TaskPriorityData,
} from './task-report.model';

@Injectable({ providedIn: 'root' })
export class TaskReportService {
  private taskStatusData: TaskStatusData = {
    pending: 10,
    inProgress: 30,
    completed: 50,
    blocked: 10,
  };

  private taskPriorityData: TaskPriorityData = {
    high: 20,
    medium: 50,
    low: 30,
  };

  constructor(
    private cover: PdfCoverService,
    private layout: PdfLayoutService,
    private chart: TaskChartService,
    private table: TaskTableService
  ) {}

  generateTaskPDF(config: TaskReportConfig): Observable<void> {
    const fullConfig = this.buildConfig(config);

    return this.fetchTaskData().pipe(
      map((data) => this.createPDF(fullConfig, data)),
      catchError((err) => {
        console.error('Error generating Task PDF', err);
        throw err;
      })
    );
  }

  private buildConfig(config: TaskReportConfig) {
    return {
      fileName: config.fileName || 'task_report',
      pdfTitle: config.pdfTitle || 'Task Report',
      includeCoverPage: config.includeCoverPage ?? true,
      reportInfo: config.reportInfo || {
        reportDate: new Date(),
        preparedBy: 'Task Management System',
      },
      headers: config.headers || this.table.defaultHeaders,
      columnKeys: config.columnKeys || this.table.defaultColumnKeys,
      data: config.data || [],
    };
  }

  private fetchTaskData(): Observable<TaskHistoryItem[]> {
    return of(this.getMockData());
  }

  private getMockData(): TaskHistoryItem[] {
    return [
      {
        id: '1',
        taskName: 'Design UI',
        assignedTo: 'John Doe',
        priority: 'High',
        status: 'In Progress',
        startDate: '2025-12-01',
        endDate: '2025-12-10',
        description: 'Design main dashboard screens',
      },
      {
        id: '2',
        taskName: 'Backend API',
        assignedTo: 'Jane Smith',
        priority: 'Medium',
        status: 'Pending',
        startDate: '2025-12-05',
        endDate: '2025-12-20',
        description: 'Implement REST API for tasks',
      },
    ];
  }

  private createPDF(config: any, data: TaskHistoryItem[]): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

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

    const chartsY = startY + 20;

    this.chart.addStatusChart(doc, 8, chartsY, this.taskStatusData);
    this.chart.addPriorityChart(
      doc,
      pageWidth / 2 + 2,
      chartsY,
      this.taskPriorityData
    );

    this.table.addTaskTable(doc, config, data, chartsY + 70, 8, pageWidth);

    doc.save(`${config.fileName}.pdf`);
  }

  updateChartData(
    statusData?: TaskStatusData,
    priorityData?: TaskPriorityData
  ) {
    if (statusData) this.taskStatusData = statusData;
    if (priorityData) this.taskPriorityData = priorityData;
  }
}
