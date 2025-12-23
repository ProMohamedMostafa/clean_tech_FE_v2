import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

// Shared & Reusable Components
import {
  TableAction,
  TableColumn,
  TableDataComponent,
} from '../../../../shared/components/table-data/table-data.component';
import { ReusableFilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';

// Translate
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Services
import { TaskService } from '../../../../shared/services/task.service';
import { CalendarService } from '../../../../shared/services/calendar.service';
import {
  ExportService,
  ExportConfig,
} from '../../../../shared/services/export.service'; // Import ExportService

// Models & Helpers
import {
  Task,
  TaskPaginationFilters,
} from '../../../../shared/models/task.model';
import { getUserRole } from '../../../../core/helpers/auth.helpers';

// Components
import { PageTitleComponent } from '../../../../shared/components/page-title/page-title.component';
import { TaskFilterComponent } from '../../../../shared/components/filters/task-filter/task-filter.component';
import { TaskContainerComponent } from '../../../../shared/components/task-container/task-container.component';
import { DailyCalendarComponent } from '../../../../shared/components/daily-calendar/daily-calendar.component';
import Swal from 'sweetalert2';
import { TaskReportService } from '../../../../shared/services/pdf-services/tasks/task-report.service';

@Component({
  selector: 'app-task-management',
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReusableFilterBarComponent,
    TaskFilterComponent,
    TranslateModule,
    PageTitleComponent,
    TaskContainerComponent,
    DailyCalendarComponent,
  ],
})
export class TaskManagementComponent implements OnInit {
  // ==================== DATA ====================
  tasks: any[] = [];
  currentUserRole: string = 'Admin';
  selectedDate: string | null = null;
  filterData: any = {};
  showFilterModal: boolean = false;
  currentRoute: string = '';
  isGeneratingPDF: boolean = false;

  // Status value mapping with translation keys
  private statusValueMap: { [key: number]: string } = {
    0: 'TASK-MANAGEMENT.STATUS.PENDING',
    1: 'TASK-MANAGEMENT.STATUS.IN_PROGRESS',
    2: 'TASK-MANAGEMENT.STATUS.WAITING_FOR_APPROVAL',
    3: 'TASK-MANAGEMENT.STATUS.COMPLETED',
    4: 'TASK-MANAGEMENT.STATUS.REJECTED',
    5: 'TASK-MANAGEMENT.STATUS.NOT_RESOLVED',
    6: 'TASK-MANAGEMENT.STATUS.OVERDUE',
  };

  // Reverse mapping for status filtering
  private statusKeyMap: { [key: string]: string } = {
    Pending: 'TASK-MANAGEMENT.STATUS.PENDING',
    InProgress: 'TASK-MANAGEMENT.STATUS.IN_PROGRESS',
    WaitingForApproval: 'TASK-MANAGEMENT.STATUS.WAITING_FOR_APPROVAL',
    Completed: 'TASK-MANAGEMENT.STATUS.COMPLETED',
    Rejected: 'TASK-MANAGEMENT.STATUS.REJECTED',
    NotResolved: 'TASK-MANAGEMENT.STATUS.NOT_RESOLVED',
    Overdue: 'TASK-MANAGEMENT.STATUS.OVERDUE',
  };

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [
    { key: 'title', label: 'TASK-MANAGEMENT.TABLE.TITLE', type: 'text' },
    {
      key: 'description',
      label: 'TASK-MANAGEMENT.TABLE.DESCRIPTION',
      type: 'text',
    },
    { key: 'dueDate', label: 'TASK-MANAGEMENT.TABLE.DUE_DATE', type: 'date' },
    { key: 'priority', label: 'TASK-MANAGEMENT.TABLE.PRIORITY', type: 'text' },
    { key: 'status', label: 'TASK-MANAGEMENT.TABLE.STATUS', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'TASK-MANAGEMENT.ACTIONS.EDIT',
      icon: 'fas fa-edit',
      action: this.editTask.bind(this),
    },
    {
      label: 'TASK-MANAGEMENT.ACTIONS.DELETE',
      icon: 'fas fa-trash-alt',
      action: this.deleteTask.bind(this),
    },
  ];

  // ==================== PAGINATION & SEARCH ====================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 12;
  searchQuery = '';

  // ==================== MODAL ====================
  showTaskModal = false;
  selectedTask: any = null;
  modalActionType: 'add' | 'edit' | 'delete' | 'archive' | 'unarchive' = 'add';

  constructor(
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    private calendarService: CalendarService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private exportService: ExportService,
    private taskReportService: TaskReportService
  ) {}

  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.getCurrentRoute();
    this.processQueryParameters();
    this.setupCalendarSubscription();
    this.loadTasks();
  }

  // ==================== QUERY PARAMETERS PROCESSING ====================

  /**
   * Process query parameters from URL (especially from chart clicks)
   */
  private processQueryParameters(): void {
    this.route.queryParams.subscribe((params) => {
      console.log('Query parameters received:', params);

      let shouldUpdateUrl = false;
      const queryParamsToRemove: any = {};

      // Handle status parameter from chart click
      if (params['status'] !== undefined) {
        const statusValue = parseInt(params['status']);
        const statusString = this.getStatusStringFromValue(statusValue);

        if (statusString) {
          console.log(
            `Setting status filter to: ${statusString} (value: ${statusValue})`
          );
          this.filterData = {
            ...this.filterData,
            Status: statusString,
          };
          queryParamsToRemove['status'] = null;
          shouldUpdateUrl = true;
        }
      }

      // Handle year parameter
      if (params['year']) {
        const year = parseInt(params['year']);
        this.filterData = {
          ...this.filterData,
          StartDate: `${year}-01-01`,
          EndDate: `${year}-12-31`,
        };
        queryParamsToRemove['year'] = null;
        shouldUpdateUrl = true;
      }

      // Handle userId parameter
      if (params['userId']) {
        const userId = parseInt(params['userId']);
        this.filterData = {
          ...this.filterData,
          AssignedTo: userId,
        };
        queryParamsToRemove['userId'] = null;
        shouldUpdateUrl = true;
      }

      // Reset to first page when filters are applied from query params
      this.currentPage = 1;

      // Remove query parameters from URL after processing
      if (shouldUpdateUrl) {
        this.router
          .navigate([], {
            relativeTo: this.route,
            queryParams: queryParamsToRemove,
            queryParamsHandling: 'merge',
            replaceUrl: true,
          })
          .catch((error) => {
            console.error('Error removing query parameters:', error);
          });
      }
    });
  }

  // ==================== ROUTE DETECTION ====================

  /**
   * Get the current route path to determine which API to call
   */
  private getCurrentRoute(): void {
    const fullUrl = this.router.url;
    const segments = fullUrl.split('/');
    this.currentRoute = segments[segments.length - 1] || '';

    if (this.currentRoute.includes('?')) {
      this.currentRoute = this.currentRoute.split('?')[0];
    }

    console.log('Current route detected:', this.currentRoute);
  }

  /**
   * Get the appropriate API method based on current route
   */
  private getTasksApiMethod(filters: TaskPaginationFilters): Observable<any> {
    console.log('API filters being sent:', filters);

    switch (this.currentRoute) {
      case 'tasks':
        return this.taskService.getTasks(filters);
      case 'my-tasks':
        return this.taskService.getMyTasks(filters);
      case 'received-tasks':
        return this.taskService.getReceivedTasks(filters);
      case 'team-tasks':
        return this.taskService.getTeamTasks(filters);
      default:
        console.warn(
          'Unknown route, falling back to getTasks:',
          this.currentRoute
        );
        return this.taskService.getTasks(filters);
    }
  }

  // ==================== LOAD & FILTER ====================

  /** Fetch tasks list from API based on current route */
  loadTasks(): void {
    const filters: TaskPaginationFilters = {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      SearchQuery: this.searchQuery,
      StartDate: this.selectedDate || undefined,
      ...this.filterData,
    };

    console.log('Loading tasks with filters:', filters);

    const apiCall = this.getTasksApiMethod(filters);

    apiCall.subscribe({
      next: (response: any) => {
        this.tasks = response.data || [];
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalCount = response.totalCount;
        this.pageSize = response.pageSize;

        console.log(
          `Loaded ${this.tasks.length} tasks from ${this.currentRoute} endpoint`
        );
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      },
    });
  }

  /** Handle page change event */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTasks();
  }

  /** Handle page size change */
  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size || 10;
    this.currentPage = 1;
    this.loadTasks();
  }

  /** Handle search change */
  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadTasks();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = {
      ...filterObj,
      CreatedBy: filterObj.createdBy,
      AssignedTo: filterObj.assignedTo,
      Status: filterObj.status,
      Priority: filterObj.priority,
      ProviderId: filterObj.provider,
      StartDate: filterObj.startDate,
      EndDate: filterObj.endDate,
      StartTime: filterObj.startTime,
      EndTime: filterObj.endTime,
      Country: filterObj.country,
      AreaId: filterObj.area,
      CityId: filterObj.city,
      OrganizationId: filterObj.organization,
      BuildingId: filterObj.building,
      FloorId: filterObj.floor,
      SectionId: filterObj.section,
      PointId: filterObj.point,
      Level: filterObj.level,
    };
    this.currentPage = 1;

    this.updateUrlWithFilters();
    this.loadTasks();
    this.closeFilterModal();
  }

  /**
   * Update URL with current filters
   */
  private updateUrlWithFilters(): void {
    const queryParams: any = {};

    if (this.filterData.Status) {
      const statusValue = this.getStatusValueFromString(this.filterData.Status);
      if (statusValue !== undefined) {
        queryParams.status = statusValue;
      }
    }

    if (this.filterData.AssignedTo) {
      queryParams.userId = this.filterData.AssignedTo;
    }

    if (Object.keys(queryParams).length > 0) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParams,
        queryParamsHandling: 'merge',
      });
    }
  }

  onDateSelected(dateString: string): void {
    this.selectedDate = dateString;
    this.currentPage = 1;
    this.loadTasks();
  }

  // ==================== DYNAMIC PAGE TITLE ====================

  /**
   * Get page title based on current route
   */
  getPageTitle(): string {
    let titleKey = '';
    switch (this.currentRoute) {
      case 'tasks':
        titleKey = 'TASK-MANAGEMENT.TITLES.ALL_TASKS';
        break;
      case 'my-tasks':
        titleKey = 'TASK-MANAGEMENT.TITLES.MY_TASKS';
        break;
      case 'received-tasks':
        titleKey = 'TASK-MANAGEMENT.TITLES.RECEIVED_TASKS';
        break;
      case 'team-tasks':
        titleKey = 'TASK-MANAGEMENT.TITLES.TEAM_TASKS';
        break;
      default:
        titleKey = 'TASK-MANAGEMENT.TITLES.TASK_MANAGEMENT';
    }

    // Return the translation key - will be translated in template
    return titleKey;
  }

  // ==================== EXPORT & PRINT ====================

  /** Export tasks list as PDF */
  /**
   * Download filtered tasks data as PDF
   * Now fetches data directly from service via TaskReportService
   */
  downloadAsPDF(): void {
    this.isGeneratingPDF = true;

    // Prepare PDF configuration based on TaskReportConfig interface
    const pdfConfig = {
      fileName: `${this.currentRoute}-tasks_${
        new Date().toISOString().split('T')[0]
      }`,
      pdfTitle: 'Task Report',
      includeCoverPage: true,
      reportInfo: {
        reportDate: new Date(),
        preparedBy: 'Task Management System',
      },
      // Required properties from TaskReportConfig interface
      headers: [
        this.translate.instant('TASK-MANAGEMENT.TABLE.TITLE'),
        this.translate.instant('TASK-MANAGEMENT.TABLE.DESCRIPTION'),
        this.translate.instant('TASK-MANAGEMENT.TABLE.DUE_DATE'),
        this.translate.instant('TASK-MANAGEMENT.TABLE.PRIORITY'),
        this.translate.instant('TASK-MANAGEMENT.TABLE.STATUS'),
      ],
      columnKeys: ['title', 'description', 'dueDate', 'priority', 'status'],
      data: this.tasks, // Current component data
      // Optional: format each column if needed
      columnFormatter: (task: any) => [
        task.title,
        task.description,
        task.dueDate,
        task.priority,
        this.translate.instant(this.getStatusTranslationKey(task.status)),
      ],
      // Pass current filters so the service can fetch filtered data
      filters: this.buildFilters(),
    };

    // Pass configuration to the TaskReportService
    this.taskReportService.generateTaskPDF(pdfConfig).subscribe({
      next: () => {
        this.isGeneratingPDF = false;
        this.showSuccess('PDF generated and downloaded successfully.');
      },
      error: (error) => {
        this.isGeneratingPDF = false;
        console.error('Error generating PDF:', error);
      },
    });
  }

  /** Export tasks list as Excel */
  downloadAsExcel(): void {
    this.translate
      .get([
        'TASK-MANAGEMENT.TABLE.TITLE',
        'TASK-MANAGEMENT.TABLE.DESCRIPTION',
        'TASK-MANAGEMENT.TABLE.DUE_DATE',
        'TASK-MANAGEMENT.TABLE.PRIORITY',
        'TASK-MANAGEMENT.TABLE.STATUS',
        'TASK-MANAGEMENT.EXPORT.EXCEL_SHEET_NAME',
      ])
      .subscribe((translations) => {
        const exportConfig: ExportConfig = {
          fileName: `${this.currentRoute}-tasks`,
          sheetName: translations['TASK-MANAGEMENT.EXPORT.EXCEL_SHEET_NAME'],
          headers: [
            translations['TASK-MANAGEMENT.TABLE.TITLE'],
            translations['TASK-MANAGEMENT.TABLE.DESCRIPTION'],
            translations['TASK-MANAGEMENT.TABLE.DUE_DATE'],
            translations['TASK-MANAGEMENT.TABLE.PRIORITY'],
            translations['TASK-MANAGEMENT.TABLE.STATUS'],
          ],
          data: this.tasks,
          columnKeys: ['title', 'description', 'dueDate', 'priority', 'status'],
          columnFormatter: (task) => [
            task.title,
            task.description,
            task.dueDate,
            task.priority,
            this.translate.instant(this.getStatusTranslationKey(task.status)),
          ],
        };

        this.exportService.exportToExcel(exportConfig);
      });
  }

  /** Print tasks list as PDF */
  printPDF(): void {
    this.translate
      .get([
        'TASK-MANAGEMENT.EXPORT.PDF_TITLE',
        'TASK-MANAGEMENT.TABLE.TITLE',
        'TASK-MANAGEMENT.TABLE.DUE_DATE',
        'TASK-MANAGEMENT.TABLE.PRIORITY',
        'TASK-MANAGEMENT.TABLE.STATUS',
      ])
      .subscribe((translations) => {
        const exportConfig: ExportConfig = {
          fileName: `${this.currentRoute}-tasks`,
          headers: [
            translations['TASK-MANAGEMENT.TABLE.TITLE'],
            translations['TASK-MANAGEMENT.TABLE.DUE_DATE'],
            translations['TASK-MANAGEMENT.TABLE.PRIORITY'],
            translations['TASK-MANAGEMENT.TABLE.STATUS'],
          ],
          data: this.tasks,
          columnKeys: ['title', 'dueDate', 'priority', 'status'],
          columnFormatter: (task) => [
            task.title,
            task.description,
            task.dueDate,
            task.priority,
            this.translate.instant(this.getStatusTranslationKey(task.status)),
          ],
          pdfTitle: translations['TASK-MANAGEMENT.EXPORT.PDF_TITLE'],
        };

        this.exportService.printPDF(exportConfig);
      });
  }

  // ==================== QUICK EXPORT METHODS ====================

  /** Quick export using simplified methods */
  quickDownloadPDF(): void {
    const tableData = this.tasks.map((task) => [
      task.title,
      task.description,
      task.dueDate,
      task.priority,
      this.translate.instant(this.getStatusTranslationKey(task.status)),
    ]);

    this.exportService.quickPDF(
      `${this.currentRoute}-tasks`,
      ['Title', 'Due Date', 'Priority', 'Status'],
      tableData
    );
  }

  quickDownloadExcel(): void {
    const tableData = this.tasks.map((task) => [
      task.title,
      task.description,
      task.dueDate,
      task.priority,
      this.translate.instant(this.getStatusTranslationKey(task.status)),
    ]);

    this.exportService.quickExcel(
      `${this.currentRoute}-tasks`,
      ['Title', 'Description', 'Due Date', 'Priority', 'Status'],
      tableData
    );
  }

  // ==================== PERMISSIONS ====================

  /** Check if user is admin */
  isAdmin(): boolean {
    return this.currentUserRole === 'Admin';
  }

  /** Check if user can create tasks (based on route) */
  canCreateTasks(): boolean {
    return (
      this.currentRoute === 'tasks' ||
      this.currentRoute === 'my-tasks' ||
      this.isAdmin()
    );
  }

  // In your component.ts
  isRecycleVisible(): boolean {
    return this.isAdmin() || this.currentRoute === 'my-tasks';
  }

  // ==================== MODAL ACTIONS ====================

  /** Close modal */
  closeTaskModal(): void {
    this.showTaskModal = false;
    this.selectedTask = null;
    this.loadTasks();
  }

  // ==================== TASK ACTIONS ====================

  onViewTask(task: any): void {
    const id = task?.id?.toString();
    if (id) {
      const baseRoute =
        this.currentUserRole === 'Admin'
          ? 'admin'
          : this.currentUserRole === 'Manager'
          ? 'manager'
          : this.currentUserRole === 'Supervisor'
          ? 'supervisor'
          : 'cleaner';

      this.router.navigate([baseRoute, 'task-details', id], {
        queryParams: { fromRoute: this.currentRoute },
      });
    }
  }

  editTask(task: Task): void {
    const id = task?.id?.toString();
    if (id) {
      const baseRoute =
        this.currentUserRole === 'Admin'
          ? 'admin'
          : this.currentUserRole === 'Manager'
          ? 'manager'
          : this.currentUserRole === 'Supervisor'
          ? 'supervisor'
          : 'cleaner';
      this.router.navigate([baseRoute, 'edit-task', id]);
    }
  }

  deleteTask(task: any): void {
    this.translate
      .get([
        'TASK-MANAGEMENT.CONFIRMATIONS.DELETE_TITLE',
        'TASK-MANAGEMENT.CONFIRMATIONS.DELETE_TEXT',
        'TASK-MANAGEMENT.CONFIRMATIONS.DELETE_CONFIRM',
        'TASK-MANAGEMENT.CONFIRMATIONS.CANCEL',
        'TASK-MANAGEMENT.MESSAGES.DELETE_SUCCESS',
      ])
      .subscribe((translations) => {
        Swal.fire({
          title: translations['TASK-MANAGEMENT.CONFIRMATIONS.DELETE_TITLE'],
          text: translations[
            'TASK-MANAGEMENT.CONFIRMATIONS.DELETE_TEXT'
          ].replace('{taskTitle}', task.title),
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText:
            translations['TASK-MANAGEMENT.CONFIRMATIONS.DELETE_CONFIRM'],
          cancelButtonText:
            translations['TASK-MANAGEMENT.CONFIRMATIONS.CANCEL'],
        }).then((result) => {
          if (result.isConfirmed) {
            this.taskService.deleteTask(task.id).subscribe(() => {
              this.showSuccess(
                translations['TASK-MANAGEMENT.MESSAGES.DELETE_SUCCESS'].replace(
                  '{taskTitle}',
                  task.title
                )
              );
              this.loadTasks();
            });
          }
        });
      });
  }

  archiveTask(task: any): void {
    this.translate
      .get('TASK-MANAGEMENT.MESSAGES.ARCHIVE_SUCCESS')
      .subscribe((message) => {
        this.taskService.archiveTask(task.id).subscribe(() => {
          this.showSuccess(message.replace('{taskTitle}', task.title));
          this.loadTasks();
        });
      });
  }

  unarchiveTask(task: any): void {
    this.translate
      .get('TASK-MANAGEMENT.MESSAGES.UNARCHIVE_SUCCESS')
      .subscribe((message) => {
        this.taskService.unarchiveTask(task.id).subscribe(() => {
          this.showSuccess(message.replace('{taskTitle}', task.title));
          this.loadTasks();
        });
      });
  }

  openAddModal(): void {
    const baseRoute =
      this.currentUserRole === 'Admin'
        ? 'admin'
        : this.currentUserRole === 'Manager'
        ? 'manager'
        : this.currentUserRole === 'Supervisor'
        ? 'supervisor'
        : 'cleaner';
    this.router.navigate([baseRoute, 'add-task']);
  }

  onStatusFilterChange(option: string): void {
    const statusMap: { [key: string]: string | undefined } = {
      opt1: undefined, // All
      opt2: 'Pending',
      opt3: 'InProgress',
      opt4: 'Completed',
      opt5: 'NotResolved',
      opt6: 'Overdue',
    };

    this.filterData = {
      ...this.filterData,
      Status: statusMap[option],
    };

    this.currentPage = 1;
    this.loadTasks();
  }

  /**
   * Clear all filters and reload tasks
   */
  clearAllFilters(): void {
    this.filterData = {};
    this.selectedDate = null;
    this.searchQuery = '';
    this.currentPage = 1;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });

    this.loadTasks();
  }

  /**
   * Check if any filters are currently active
   */
  hasActiveFilters(): boolean {
    return (
      Object.keys(this.filterData).length > 0 ||
      this.selectedDate !== null ||
      this.searchQuery !== ''
    );
  }

  // ==================== HELPER METHODS ====================

  private setupCalendarSubscription(): void {
    this.calendarService.selectedDate$.subscribe((date) => {
      if (date) {
        this.selectedDate = date.toISOString().split('T')[0];
        this.loadTasks();
      }
    });
  }

  private buildFilters(): TaskPaginationFilters {
    return {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      SearchQuery: this.searchQuery,
      DueDate: this.selectedDate || undefined,
      ...this.filterData,
    };
  }

  private showSuccess(message: string): void {
    this.translate
      .get('TASK-MANAGEMENT.MESSAGES.SUCCESS_TITLE')
      .subscribe((title) => {
        Swal.fire({
          icon: 'success',
          title: title,
          text: message,
        });
      });
  }

  isAdminOrManager(): boolean {
    return (
      this.currentUserRole === 'Admin' || this.currentUserRole === 'Manager'
    );
  }

  // ==================== MODAL METHODS - FIXED ====================

  /**
   * Open filter modal with proper change detection
   */
  openFilterModal(): void {
    console.log('Opening filter modal...');
    this.showFilterModal = true;

    // Force change detection to ensure the view updates
    this.cdr.detectChanges();

    // Alternative: Use setTimeout to ensure the change is processed
    setTimeout(() => {
      this.cdr.markForCheck();
    }, 0);
  }

  /**
   * Close filter modal with proper change detection
   */
  closeFilterModal(): void {
    console.log('Closing filter modal...');
    this.showFilterModal = false;
    this.cdr.detectChanges();
  }

  // ==================== STATUS UTILITY METHODS ====================

  /**
   * Get status string from numeric value (for processing query params)
   */
  private getStatusStringFromValue(value: number): string | undefined {
    const statusKeys = Object.keys(this.statusValueMap);
    for (const key of statusKeys) {
      if (parseInt(key) === value) {
        // Return the original string value, not translation key
        switch (value) {
          case 0:
            return 'Pending';
          case 1:
            return 'InProgress';
          case 2:
            return 'WaitingForApproval';
          case 3:
            return 'Completed';
          case 4:
            return 'Rejected';
          case 5:
            return 'NotResolved';
          case 6:
            return 'Overdue';
          default:
            return undefined;
        }
      }
    }
    return undefined;
  }

  /**
   * Get numeric value from status string (for URL params)
   */
  private getStatusValueFromString(status: string): number | undefined {
    switch (status) {
      case 'Pending':
        return 0;
      case 'InProgress':
        return 1;
      case 'WaitingForApproval':
        return 2;
      case 'Completed':
        return 3;
      case 'Rejected':
        return 4;
      case 'NotResolved':
        return 5;
      case 'Overdue':
        return 6;
      default:
        return undefined;
    }
  }

  /**
   * Get translation key for status
   */
  private getStatusTranslationKey(status: string): string {
    return this.statusKeyMap[status] || 'TASK-MANAGEMENT.STATUS.UNKNOWN';
  }
}
