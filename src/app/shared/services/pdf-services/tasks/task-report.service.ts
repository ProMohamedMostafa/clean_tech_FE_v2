// task-report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import jsPDF from 'jspdf';
import { PdfCoverService } from '../general layout/pdf-cover.service';
import { PdfLayoutService } from '../general layout/pdf-layout.service';
import { TaskChartService } from './task-chart.service';
import { TaskTableService } from './task-table.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  TaskPriorityData,
  TaskReportApiResponse,
  TaskReportData,
  TaskStatusData,
} from './task-report.model';
import { environment } from '../../../../../environments/environment';

// Define the new task interface based on your API response
interface ApiTaskItem {
  title: string;
  status: string;
  priority: string;
  description: string;
  startDate: string;
  endDate: string;
  point: string;
}

@Injectable({ providedIn: 'root' })
export class TaskReportService {
  private apiUrl = `${environment.apiUrl}/tasks/report`;

  private taskStatusData: any = {
    pending: 0,
    inProgress: 0,
    completed: 0,
  };

  private taskPriorityData: TaskPriorityData = {
    high: 0,
    medium: 0,
    low: 0,
  };

  constructor(
    private http: HttpClient,
    private cover: PdfCoverService,
    private layout: PdfLayoutService,
    private chart: TaskChartService,
    private table: TaskTableService
  ) {}

  generateTaskPDF(config: any): Observable<void> {
    const fullConfig = this.buildConfig(config);

    return this.fetchTaskData(fullConfig).pipe(
      map((data) => {
        this.createPDF(fullConfig, data);
        return void 0;
      }),
      catchError((err) => {
        console.error('Error generating Task PDF', err);
        throw err;
      })
    );
  }

  private buildConfig(config: any): any {
    return {
      fileName:
        config.fileName ||
        `task_report_${new Date().toISOString().split('T')[0]}`,
      pdfTitle: config.pdfTitle || 'Task Report',
      includeCoverPage: config.includeCoverPage ?? true,
      reportInfo: {
        fromDate: config.startDate || new Date().toISOString().split('T')[0],
        toDate: config.endDate || new Date().toISOString().split('T')[0],
        preparedBy: config.reportInfo?.preparedBy || 'Task Management System',
      },
      // Use custom headers for the new data structure
      headers: config.headers || [
        'Title',
        'Description',
        'Start Date',
        'End Date',
        'Priority',
        'Status',
        'Point',
      ],
      // Map to the new API field names
      columnKeys: config.columnKeys || [
        'title',
        'description',
        'startDate',
        'endDate',
        'priority',
        'status',
        'point',
      ],
      data: config.data || [],
      // Pass API parameters through
      startDate: config.startDate,
      endDate: config.endDate,
      status: config.status,
      priority: config.priority,
      assignTo: config.assignTo,
    };
  }

  private fetchTaskData(config: any): Observable<TaskReportData> {
    // Build query parameters using HttpParams for proper URL encoding
    let params = new HttpParams();

    if (config.startDate) {
      params = params.set('StartDate', config.startDate);
    }
    if (config.endDate) {
      params = params.set('EndDate', config.endDate);
    }
    if (config.status !== undefined && config.status !== null) {
      params = params.set('Status', config.status.toString());
    }
    if (config.priority !== undefined && config.priority !== null) {
      params = params.set('Priority', config.priority.toString());
    }
    if (config.assignTo !== undefined && config.assignTo !== null) {
      params = params.set('AssignTo', config.assignTo.toString());
    }

    return this.http.get<TaskReportApiResponse>(this.apiUrl, { params }).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch task data');
        }

        // Transform API data to match expected formats
        this.transformChartData(response.data);

        // Transform tasks to the expected format
        const transformedTasks = this.transformTaskData(
          response.data.tasks || []
        );

        return {
          ...response.data,
          tasks: transformedTasks,
        };
      }),
      catchError((error) => {
        console.error('API Error:', error);
        // Return empty data structure on error
        return of({
          from: config.startDate || new Date().toISOString().split('T')[0],
          to: config.endDate || new Date().toISOString().split('T')[0],
          total: 0,
          status: { labels: [], values: [] },
          priority: { labels: [], values: [] },
          tasks: [],
        });
      })
    );
  }

  // Transform API task data to match the expected format
  private transformTaskData(apiTasks: any[]): any[] {
    return apiTasks.map((task: ApiTaskItem) => ({
      // Map API fields to expected table fields
      title: task.title || 'N/A',
      description: task.description || 'N/A',
      startDate: task.startDate || 'N/A',
      endDate: task.endDate || 'N/A',
      priority: task.priority || 'N/A',
      status: task.status || 'N/A',
      point: task.point || 'N/A',
    }));
  }

  private transformChartData(apiData: TaskReportData): void {
    // Reset data
    this.taskStatusData = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      blocked: 0,
    };
    this.taskPriorityData = { high: 0, medium: 0, low: 0 };

    // Transform status data
    if (apiData.status?.labels && apiData.status?.values) {
      apiData.status.labels.forEach((label, index) => {
        const value = apiData.status.values[index] || 0;
        const normalizedLabel = label.toLowerCase().trim();

        switch (normalizedLabel) {
          case 'pending':
            this.taskStatusData.pending = value;
            break;
          case 'in progress':
            this.taskStatusData.inProgress = value;
            break;
          case 'completed':
            this.taskStatusData.completed = value;
            break;
          case 'waiting for approval':
          case 'waitingforapproval':
            if (!this.taskStatusData.waitingForApproval) {
              this.taskStatusData.waitingForApproval = 0;
            }
            this.taskStatusData.waitingForApproval += value;
            break;
          case 'rejected':
            if (!this.taskStatusData.rejected) {
              this.taskStatusData.rejected = 0;
            }
            this.taskStatusData.rejected += value;
            break;
          case 'not resolved':
          case 'notresolved':
            if (!this.taskStatusData.notResolved) {
              this.taskStatusData.notResolved = 0;
            }
            this.taskStatusData.notResolved += value;
            break;
          case 'overdue':
            if (!this.taskStatusData.overdue) {
              this.taskStatusData.overdue = 0;
            }
            this.taskStatusData.overdue += value;
            break;
        }
      });
    }

    // Transform priority data
    if (apiData.priority?.labels && apiData.priority?.values) {
      apiData.priority.labels.forEach((label, index) => {
        const value = apiData.priority.values[index] || 0;
        const normalizedLabel = label.toLowerCase().trim();

        switch (normalizedLabel) {
          case 'high':
            this.taskPriorityData.high = value;
            break;
          case 'medium':
            this.taskPriorityData.medium = value;
            break;
          case 'low':
            this.taskPriorityData.low = value;
            break;
        }
      });
    }
  }

  private createPDF(config: any, apiData: TaskReportData): void {
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

    const fromDate =
      apiData.from || config.startDate || config.reportInfo?.fromDate || 'N/A';
    const toDate =
      apiData.to || config.endDate || config.reportInfo?.toDate || 'N/A';

    const fromDateDisplay = formatDateForDisplay(fromDate);
    const toDateDisplay = formatDateForDisplay(toDate);

    // ================= COVER =================
    if (config.includeCoverPage) {
      // Pass the formatted dates to the cover service
      const coverConfig = {
        ...config,
        reportInfo: {
          ...config.reportInfo,
          fromDate: fromDateDisplay,
          toDate: toDateDisplay,
        },
        // Add a special config for the cover service to use dynamic dates
        coverPageConfig: {
          title: config.pdfTitle || 'Task Report',
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
      config.pdfTitle || 'Task Report',
      pageWidth,
      fromDateDisplay,
      toDateDisplay
    );

    const chartsY = startY + 30;

    // Charts
    this.chart.addStatusChart(doc, marginX, 30, this.taskStatusData);
    this.chart.addPriorityChart(
      doc,
      pageWidth / 2 + 2,
      30,
      this.taskPriorityData
    );

    // Table below charts
    const tableY = chartsY + 40;

    // Use API data for the table
    const tableData = apiData.tasks || config.data || [];

    if (tableData.length > 0) {
      this.table.addTaskTable(
        doc,
        config,
        tableData,
        tableY,
        marginX,
        pageWidth
      );
    } else {
      // Show "No data" message if no tasks
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('No tasks found for the selected criteria', marginX, tableY);
    }

    // Apply header & footer to all pages (after cover)
    this.layout.applyHeaderFooterToAllPages(
      doc,
      config.pdfTitle || 'Task Report',
      pageWidth,
      fromDateDisplay,
      toDateDisplay
    );

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
