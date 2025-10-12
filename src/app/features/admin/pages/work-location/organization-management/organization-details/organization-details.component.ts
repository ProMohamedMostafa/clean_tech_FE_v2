import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// ==================== THIRD-PARTY LIBRARIES ====================
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ==================== SERVICES & MODELS ====================
import { UserService } from '../../../../services/user.service';
import { UserModel } from '../../../../models/user.model';
import { ShiftService } from '../../../../services/shift.service';
import { Shift } from '../../../../models/shift.model';
import { AttendanceService } from '../../../../services/attendance.service';
import { AttendanceHistoryItem } from '../../../../models/attendance.model';
import { LeaveService } from '../../../../services/leave.service';
import { LeaveItem } from '../../../../models/leave.model';
import { TaskService } from '../../../../../../shared/services/task.service';

// ==================== CUSTOM COMPONENTS ====================
import {
  TableDataComponent,
  TableAction,
  TableColumn,
} from '../../../../../../shared/components/table-data/table-data.component';
import { TaskContainerComponent } from '../../../../../../shared/components/task-container/task-container.component';

// ==================== HELPERS ====================
import { getUserRole } from '../../../../../../core/helpers/auth.helpers';
import { TaskStatus } from '../../../../../../shared/models/task.model';
import { OrganizationService } from '../../../../services/work-location/organization.service';
import { OrganizationDetailsInfoComponent } from './organization-details-info/organization-details-info.component';
import { OrganizationTreeComponent } from './organization-tree/organization-tree.component';

interface ExportOptions {
  users: boolean;
  tasks: boolean;
  shifts: boolean;
  attendance: boolean;
  leaves: boolean;
}

@Component({
  selector: 'app-organization-details',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    OrganizationDetailsInfoComponent,
    OrganizationTreeComponent,
    TableDataComponent,
    TaskContainerComponent,
    FormsModule,
  ],
  templateUrl: './organization-details.component.html',
  styleUrl: '../../area-management/area-details/area-details.component.scss',
})
export class OrganizationDetailsComponent {
  // ==================== COMPONENT STATE ====================
  selectedTab: string = 'location';
  organizationData: any | null = null;
  organizationId: number | null = null;
  isLoading: boolean = false;
  currentUserRole: string = '';
  myRole: string = getUserRole().toLocaleLowerCase();

  // ==================== DATA PROPERTIES ====================
  // Users
  users: UserModel[] = [];
  currentPage: number = 1;
  pageSize: number | undefined = 5;
  totalPages: number = 1;
  totalCount: number = 0;

  // Tasks
  tasks: any[] = [];
  taskCurrentPage = 1;
  taskTotalPages = 0;
  taskPageSize = 10;
  taskTotalCount = 0;
  taskLoading: boolean = false;
  taskFilters: any = {};

  // Shifts
  shifts: Shift[] = [];
  shiftCurrentPage = 1;
  shiftTotalPages = 0;
  shiftPageSize = 10;
  shiftTotalCount = 0;
  shiftLoading: boolean = false;
  shiftFilters: any = {};

  // Attendance
  attendanceHistory: AttendanceHistoryItem[] = [];
  attendanceCurrentPage = 1;
  attendanceTotalPages = 0;
  attendancePageSize = 10;
  attendanceTotalCount = 0;
  attendanceLoading: boolean = false;
  attendanceFilters: any = {};

  // Leaves
  leaveHistory: LeaveItem[] = [];
  leaveCurrentPage = 1;
  leaveTotalPages = 0;
  leavePageSize = 10;
  leaveTotalCount = 0;
  leaveLoading: boolean = false;
  leaveFilters: any = {};

  // Export
  showExportModal: boolean = false;
  exportAll: boolean = false;
  exportFormat: string = 'excel';
  exportOptions: ExportOptions = {
    users: false,
    tasks: false,
    shifts: false,
    attendance: false,
    leaves: false,
  };

  // ==================== TABLE CONFIGURATIONS ====================
  tableColumns: TableColumn[] = [
    { key: 'image', label: 'UserTABLE.USERS', type: 'image' },
    { key: 'email', label: 'UserTABLE.EMAIL', type: 'text' },
    { key: 'role', label: 'UserTABLE.ROLE', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      icon: 'fas fa-edit',
      label: 'Edit User',
      action: (user) => this.openEditModal(user),
      condition: (_, role) => role === 'Admin',
    },
    {
      icon: 'fas fa-eye',
      label: 'View User Details',
      action: (user) => this.navigateToUserDetails(user.id),
      condition: () => true,
    },
    {
      icon: 'fas fa-trash-alt',
      label: 'Delete User',
      action: (user) => this.deleteUser(user),
      condition: (_, role) => role === 'Admin',
    },
  ];

  shiftTableColumns: TableColumn[] = [
    { key: 'name', label: 'ShiftTABLE.NAME', type: 'text' },
    { key: 'startDate', label: 'ShiftTABLE.START_DATE', type: 'text' },
    { key: 'endDate', label: 'ShiftTABLE.END_DATE', type: 'text' },
    { key: 'startTime', label: 'ShiftTABLE.START_TIME', type: 'text' },
    { key: 'endTime', label: 'ShiftTABLE.END_TIME', type: 'text' },
  ];

  shiftTableActions: TableAction[] = [
    {
      icon: 'fas fa-eye',
      label: 'View Shift Details',
      action: (shift) => this.navigateToShiftDetails(shift.id),
      condition: () => true,
    },
    {
      icon: 'fas fa-edit',
      label: 'Edit Shift',
      action: (shift) => this.navigateToEditShift(shift.id),
      condition: (_, role) => role === 'Admin' || role === 'Manager',
    },
  ];

  attendanceTableColumns: TableColumn[] = [
    { key: 'date', label: 'ATTENDANCE.DATE', type: 'text' },
    { key: 'clockIn', label: 'ATTENDANCE.CLOCK_IN', type: 'date' },
    { key: 'clockOut', label: 'ATTENDANCE.CLOCK_OUT', type: 'date' },
    { key: 'duration', label: 'ATTENDANCE.DURATION', type: 'text' },
    { key: 'status', label: 'ATTENDANCE.STATUS', type: 'text' },
  ];

  attendanceTableActions: TableAction[] = [
    {
      icon: 'fas fa-eye',
      label: 'View Attendance Details',
      action: (item) => this.viewAttendanceDetails(item),
      condition: () => true,
    },
    {
      icon: 'fas fa-edit',
      label: 'Edit Attendance',
      action: (item) => this.editAttendance(item),
      condition: (_, role) => role === 'Admin' || role === 'Manager',
    },
  ];

  leaveTableColumns: TableColumn[] = [
    { key: 'startDate', label: 'LEAVE.START_DATE', type: 'date' },
    { key: 'endDate', label: 'LEAVE.END_DATE', type: 'date' },
    { key: 'type', label: 'LEAVE.TYPE', type: 'text' },
    { key: 'status', label: 'LEAVE.STATUS', type: 'text' },
    { key: 'reason', label: 'LEAVE.REASON', type: 'text' },
  ];

  leaveTableActions: TableAction[] = [
    {
      icon: 'fas fa-eye',
      label: 'View Leave Details',
      action: (item) => this.viewLeaveDetails(item),
      condition: () => true,
    },
    {
      icon: 'fas fa-trash-alt',
      label: 'Delete Leave',
      action: (item) => this.deleteLeave(item),
      condition: (_, role) => role === 'Admin' || role === 'Manager',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private userService: UserService,
    private taskService: TaskService,
    private shiftService: ShiftService,
    private attendanceService: AttendanceService,
    private leaveService: LeaveService,
    private location: Location,
    private router: Router
  ) {}

  // ==================== LIFECYCLE HOOKS ====================
  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.initializeRouteParams();
  }

  // ==================== INITIALIZATION METHODS ====================
  private initializeRouteParams(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.organizationId = id ? +id : null;
      if (this.organizationId) {
        this.loadOrganizationDetails(this.organizationId);
      } else {
        this.handleInvalidId();
      }
    });
  }

  // ==================== DATA LOADING METHODS ====================
  loadOrganizationDetails(id: number): void {
    this.isLoading = true;
    this.organizationService.getOrganizationById(id).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response) {
          this.organizationData = response;
        } else {
          this.handleAccessDenied();
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 403 || err.status === 401) {
          this.handleAccessDenied();
        } else {
          this.showError(
            'Could not load organization details. Please try again later.'
          );
        }
      },
    });
  }

  loadUsersByOrganization(organizationId: number): void {
    this.isLoading = true;
    const filters = {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      OrganizationId: organizationId,
    };

    this.userService.getUsersWithPagination(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.succeeded) {
          this.users = response.data.data;
          this.currentPage = response.data.currentPage;
          this.totalPages = response.data.totalPages;
          this.totalCount = response.data.totalCount;
        } else {
          this.showError('Failed to load users for this organization');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showError('Error loading users for this organization');
      },
    });
  }

  loadTasks(): void {
    if (!this.organizationId) return;

    this.taskLoading = true;
    const filters: any = {
      pageNumber: this.taskCurrentPage,
      pageSize: this.taskPageSize,
      organizationId: this.organizationId,
      ...this.taskFilters,
    };

    this.taskService.getTasks(filters).subscribe({
      next: (response) => this.handleTaskResponse(response),
      error: (err) => this.handleTaskError(err),
    });
  }

  loadShifts(): void {
    if (!this.organizationId) return;

    this.shiftLoading = true;
    const filters: any = {
      pageNumber: this.shiftCurrentPage,
      pageSize: this.shiftPageSize,
      organization: this.organizationId,
      ...this.shiftFilters,
    };

    this.shiftService.getPaginatedShifts(filters).subscribe({
      next: (response) => this.handleShiftResponse(response),
      error: (err) => this.handleShiftError(err),
    });
  }

  loadAttendance(): void {
    if (!this.organizationId) return;

    this.attendanceLoading = true;
    const filters: any = {
      PageNumber: this.attendanceCurrentPage,
      PageSize: this.attendancePageSize,
      OrganizationId: this.organizationId,
      ...this.attendanceFilters,
    };

    this.attendanceService.getAttendanceHistory(filters).subscribe({
      next: (response) => this.handleAttendanceResponse(response),
      error: (err) => this.handleAttendanceError(err),
    });
  }

  loadLeaves(): void {
    if (!this.organizationId) return;

    this.leaveLoading = true;
    const filters: any = {
      PageNumber: this.leaveCurrentPage,
      PageSize: this.leavePageSize,
      OrganizationId: this.organizationId,
      ...this.leaveFilters,
    };

    this.leaveService.getLeavesWithPagination(filters).subscribe({
      next: (response) => this.handleLeaveResponse(response),
      error: (err) => this.handleLeaveError(err),
    });
  }

  // ==================== TAB MANAGEMENT ====================
  selectTab(tab: string): void {
    this.selectedTab = tab;
    if (tab === 'users' && this.organizationId) {
      this.loadUsersByOrganization(this.organizationId);
    }
    if (tab === 'tasks' && this.organizationId) {
      this.loadTasks();
    }
    if (tab === 'shifts' && this.organizationId) {
      this.loadShifts();
    }
    if (tab === 'attendance' && this.organizationId) {
      this.loadAttendance();
    }
    if (tab === 'leaves' && this.organizationId) {
      this.loadLeaves();
    }
  }

  // ==================== USER MANAGEMENT ====================
  onPageChanged(page: number): void {
    this.currentPage = page;
    if (this.organizationId) {
      this.loadUsersByOrganization(this.organizationId);
    }
  }

  onPageSizeChanged(size: number | undefined): void {
    this.pageSize = size ?? 10;
    this.currentPage = 1;
    if (this.organizationId) {
      this.loadUsersByOrganization(this.organizationId);
    }
  }

  openEditModal(user: UserModel): void {
    this.router.navigate([
      `/${this.currentUserRole.toLowerCase()}/edit-user`,
      user.id,
    ]);
  }

  navigateToUserDetails(userId: number): void {
    this.router.navigate([
      `/${this.currentUserRole.toLowerCase()}/user-details`,
      userId,
    ]);
  }

  async deleteUser(user: UserModel): Promise<void> {
    const result = await Swal.fire({
      title: 'Delete User?',
      text: `Are you sure you want to delete ${user.userName}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });

    if (result.isConfirmed) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          Swal.fire('Deleted!', 'User has been deleted.', 'success');
          if (this.organizationId) {
            this.loadUsersByOrganization(this.organizationId);
          }
        },
        error: (err) => {
          Swal.fire('Error!', 'Failed to delete user.', 'error');
        },
      });
    }
  }

  // ==================== TASK MANAGEMENT ====================
  private handleTaskResponse(response: any): void {
    if (!response || !response.data) {
      console.error('Invalid API response structure:', response);
      this.handleTaskErrorResponse();
      return;
    }

    this.tasks = response.data;
    this.taskCurrentPage = response.data.currentPage || 1;
    this.taskTotalPages = response.data.totalPages || 0;
    this.taskTotalCount = response.data.totalCount || 0;
    this.taskLoading = false;
  }

  private handleTaskError(err: any): void {
    console.error('Failed to load tasks:', err);
    this.handleTaskErrorResponse();
    this.taskLoading = false;
  }

  private handleTaskErrorResponse(): void {
    this.tasks = [];
    this.taskCurrentPage = 1;
    this.taskTotalPages = 0;
    this.taskTotalCount = 0;
    this.taskLoading = false;
  }

  onTaskPageChanged(page: number): void {
    this.taskCurrentPage = page;
    this.loadTasks();
  }

  onTaskPageSizeChanged(size: number): void {
    this.taskPageSize = size;
    this.taskCurrentPage = 1;
    this.loadTasks();
  }

  onViewTask(task: any): void {
    this.router.navigate([
      `/${this.currentUserRole.toLowerCase()}/task-details`,
      task.id,
    ]);
  }

  onEditTask(task: any): void {
    this.router.navigate([
      `/${this.currentUserRole.toLowerCase()}/edit-task`,
      task.id,
    ]);
  }

  async onDeleteTask(task: any): Promise<void> {
    const result = await Swal.fire({
      title: 'Delete Task?',
      text: `Are you sure you want to delete "${task.title}" task?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });

    if (result.isConfirmed) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          Swal.fire('Deleted!', 'Task has been deleted.', 'success');
          this.loadTasks();
        },
        error: (err) => {
          Swal.fire('Error!', 'Failed to delete task.', 'error');
        },
      });
    }
  }

  onStatusFilterChange(selectedOption: string): void {
    this.taskFilters = { ...this.taskFilters };
    delete this.taskFilters.status;

    switch (selectedOption) {
      case 'opt1':
        break; // All tasks
      case 'opt2':
        this.taskFilters.status = TaskStatus.Pending;
        break;
      case 'opt3':
        this.taskFilters.status = TaskStatus.InProgress;
        break;
      case 'opt4':
        this.taskFilters.status = TaskStatus.Completed;
        break;
      case 'opt5':
        this.taskFilters.status = TaskStatus.NotResolved;
        break;
      case 'opt6':
        this.taskFilters.status = TaskStatus.Overdue;
        break;
    }

    this.currentPage = 1;
    this.loadTasks();
  }

  // ==================== SHIFT MANAGEMENT ====================
  private handleShiftResponse(response: any): void {
    if (!response || !response.data) {
      console.error('Invalid API response structure:', response);
      this.handleShiftErrorResponse();
      return;
    }

    this.shifts = response.data.data || [];
    this.shiftCurrentPage = response.data.currentPage || 1;
    this.shiftTotalPages = response.data.totalPages || 0;
    this.shiftTotalCount = response.data.totalCount || 0;
    this.shiftLoading = false;
  }

  private handleShiftError(err: any): void {
    console.error('Failed to load shifts:', err);
    this.handleShiftErrorResponse();
    this.shiftLoading = false;
  }

  private handleShiftErrorResponse(): void {
    this.shifts = [];
    this.shiftCurrentPage = 1;
    this.shiftTotalPages = 0;
    this.shiftTotalCount = 0;
    this.shiftLoading = false;
  }

  onShiftPageChanged(page: number): void {
    this.shiftCurrentPage = page;
    this.loadShifts();
  }

  onShiftPageSizeChanged(size: number | undefined): void {
    this.shiftPageSize = size ?? 10;
    this.shiftCurrentPage = 1;
    this.loadShifts();
  }

  navigateToShiftDetails(shiftId: number): void {
    this.router.navigate([
      `/${this.currentUserRole.toLowerCase()}/shift-details`,
      shiftId,
    ]);
  }

  navigateToEditShift(shiftId: number): void {
    this.router.navigate([
      `/${this.currentUserRole.toLowerCase()}/edit-shift`,
      shiftId,
    ]);
  }

  // ==================== ATTENDANCE MANAGEMENT ====================
  private handleAttendanceResponse(response: any): void {
    if (!response || !response.data) {
      console.error('Invalid API response structure:', response);
      this.handleAttendanceErrorResponse();
      return;
    }

    this.attendanceHistory = response.data.data || [];
    this.attendanceCurrentPage = response.data.currentPage || 1;
    this.attendanceTotalPages = response.data.totalPages || 0;
    this.attendanceTotalCount = response.data.totalCount || 0;
    this.attendanceLoading = false;
  }

  private handleAttendanceError(err: any): void {
    console.error('Failed to load attendance:', err);
    this.handleAttendanceErrorResponse();
    this.attendanceLoading = false;
  }

  private handleAttendanceErrorResponse(): void {
    this.attendanceHistory = [];
    this.attendanceCurrentPage = 1;
    this.attendanceTotalPages = 0;
    this.attendanceTotalCount = 0;
    this.attendanceLoading = false;
  }

  onAttendancePageChanged(page: number): void {
    this.attendanceCurrentPage = page;
    this.loadAttendance();
  }

  onAttendancePageSizeChanged(size: number | undefined): void {
    this.attendancePageSize = size ?? 10;
    this.attendanceCurrentPage = 1;
    this.loadAttendance();
  }

  viewAttendanceDetails(item: AttendanceHistoryItem): void {
    this.router.navigate(
      [
        `/${this.currentUserRole.toLowerCase()}/attendance-details`,
        item.userId,
      ],
      { state: { attendanceData: item } }
    );
  }

  editAttendance(item: AttendanceHistoryItem): void {
    this.router.navigate(
      [`/${this.currentUserRole.toLowerCase()}/edit-attendance`, item.userId],
      { state: { attendanceData: item } }
    );
  }

  // ==================== LEAVE MANAGEMENT ====================
  private handleLeaveResponse(response: any): void {
    if (!response || !response.data) {
      console.error('Invalid API response structure:', response);
      this.handleLeaveErrorResponse();
      return;
    }

    this.leaveHistory = response.data.data || [];
    this.leaveCurrentPage = response.data.currentPage || 1;
    this.leaveTotalPages = response.data.totalPages || 0;
    this.leaveTotalCount = response.data.totalCount || 0;
    this.leaveLoading = false;
  }

  private handleLeaveError(err: any): void {
    console.error('Failed to load leaves:', err);
    this.handleLeaveErrorResponse();
    this.leaveLoading = false;
  }

  private handleLeaveErrorResponse(): void {
    this.leaveHistory = [];
    this.leaveCurrentPage = 1;
    this.leaveTotalPages = 0;
    this.leaveTotalCount = 0;
    this.leaveLoading = false;
  }

  onLeavePageChanged(page: number): void {
    this.leaveCurrentPage = page;
    this.loadLeaves();
  }

  onLeavePageSizeChanged(size: number | undefined): void {
    this.leavePageSize = size ?? 10;
    this.leaveCurrentPage = 1;
    this.loadLeaves();
  }

  viewLeaveDetails(item: LeaveItem): void {
    this.router.navigate(
      [`/${this.currentUserRole.toLowerCase()}/leave-details`, item.id],
      { state: { leaveData: item } }
    );
  }

  editLeave(item: LeaveItem): void {
    this.router.navigate(
      [`/${this.currentUserRole.toLowerCase()}/edit-leave`, item.id],
      { state: { leaveData: item } }
    );
  }

  async deleteLeave(item: LeaveItem): Promise<void> {
    const result = await Swal.fire({
      title: 'Delete Leave',
      text: 'Are you sure you want to delete this leave request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      this.leaveService.deleteLeave(item.id).subscribe({
        next: () => {
          Swal.fire('Deleted!', 'Leave request has been deleted.', 'success');
          this.loadLeaves();
        },
        error: (err) => {
          console.error('Failed to delete leave:', err);
          Swal.fire('Error!', 'Failed to delete leave request.', 'error');
        },
      });
    }
  }

  // ==================== EXPORT MANAGEMENT ====================
  openExportModal(): void {
    this.resetExportOptions();
    const currentTab = this.selectedTab as keyof ExportOptions;
    if (currentTab in this.exportOptions) {
      this.exportOptions[currentTab] = true;
    }
    this.showExportModal = true;
  }

  closeExportModal(): void {
    this.showExportModal = false;
    this.resetExportOptions();
  }

  resetExportOptions(): void {
    this.exportAll = false;
    this.exportFormat = 'excel';
    this.exportOptions = {
      users: false,
      tasks: false,
      shifts: false,
      attendance: false,
      leaves: false,
    };
  }

  toggleExportAll(): void {
    if (this.exportAll) {
      this.exportOptions = {
        users: true,
        tasks: true,
        shifts: true,
        attendance: true,
        leaves: true,
      };
    } else {
      this.resetExportOptions();
    }
  }

  exportData(): void {
    if (!this.organizationId) return;

    const hasSelection = Object.values(this.exportOptions).some((val) => val);
    if (!hasSelection) {
      Swal.fire({
        title: 'No Selection',
        text: 'Please select at least one data type to export.',
        icon: 'warning',
      });
      return;
    }

    const exportData = {
      format: this.exportFormat,
      organizationId: this.organizationId,
      options: this.exportOptions,
    };

    this.performExport(exportData);
  }

  private performExport(exportData: any): void {
    if (exportData.format === 'excel') {
      this.exportToExcel();
    } else {
      this.exportToPDF();
    }
    this.closeExportModal();
  }

  private exportToExcel(): void {
    const workbook = XLSX.utils.book_new();

    if (this.exportOptions.users && this.users.length) {
      const ws = XLSX.utils.json_to_sheet(this.users);
      XLSX.utils.book_append_sheet(workbook, ws, 'Users');
    }

    if (this.exportOptions.tasks && this.tasks.length) {
      const ws = XLSX.utils.json_to_sheet(this.tasks);
      XLSX.utils.book_append_sheet(workbook, ws, 'Tasks');
    }

    if (this.exportOptions.shifts && this.shifts.length) {
      const ws = XLSX.utils.json_to_sheet(this.shifts);
      XLSX.utils.book_append_sheet(workbook, ws, 'Shifts');
    }

    if (this.exportOptions.attendance && this.attendanceHistory.length) {
      const ws = XLSX.utils.json_to_sheet(this.attendanceHistory);
      XLSX.utils.book_append_sheet(workbook, ws, 'Attendance');
    }

    if (this.exportOptions.leaves && this.leaveHistory.length) {
      const ws = XLSX.utils.json_to_sheet(this.leaveHistory);
      XLSX.utils.book_append_sheet(workbook, ws, 'Leaves');
    }

    XLSX.writeFile(workbook, `organization_${this.organizationId}_data.xlsx`);
  }

  private exportToPDF(): void {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(16);
    doc.text(
      `Organization Report: ${this.organizationData?.name || 'Unknown'}`,
      105,
      yPos,
      {
        align: 'center',
      }
    );
    yPos += 15;

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, yPos, {
      align: 'center',
    });
    yPos += 15;

    if (this.exportOptions.users && this.users.length) {
      this.addTableToPDF(doc, 'Users', this.users, yPos);
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    if (this.exportOptions.tasks && this.tasks.length) {
      this.addTableToPDF(doc, 'Tasks', this.tasks, yPos);
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    if (this.exportOptions.shifts && this.shifts.length) {
      this.addTableToPDF(doc, 'Shifts', this.shifts, yPos);
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    if (this.exportOptions.attendance && this.attendanceHistory.length) {
      this.addTableToPDF(doc, 'Attendance', this.attendanceHistory, yPos);
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    if (this.exportOptions.leaves && this.leaveHistory.length) {
      this.addTableToPDF(doc, 'Leaves', this.leaveHistory, yPos);
    }

    doc.save(`organization_${this.organizationId}_report.pdf`);
  }

  private addTableToPDF(
    doc: jsPDF,
    title: string,
    data: any[],
    yPos: number
  ): void {
    doc.setFontSize(14);
    doc.text(title, 14, yPos);
    yPos += 7;

    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const body = data.map((item) => headers.map((header) => item[header]));

    autoTable(doc, {
      startY: yPos,
      head: [headers],
      body: body,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });
  }

  // ==================== ORGANIZATION MANAGEMENT ====================
  onEditOrganization(): void {
    if (!this.organizationId) return;
    this.router.navigate([
      `/${this.currentUserRole.toLowerCase()}/edit-organization`,
      this.organizationId,
    ]);
  }

  async onDeleteOrganization(): Promise<void> {
    if (!this.organizationId || !this.organizationData) return;

    const result = await Swal.fire({
      title: 'Delete Organization?',
      text: `Are you sure you want to delete "${this.organizationData.name}" organization? This will also delete all associated data.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });

    if (result.isConfirmed) {
      this.organizationService
        .softDeleteOrganization(this.organizationId)
        .subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Organization has been deleted.', 'success');
            this.router.navigate([
              `/${this.currentUserRole.toLowerCase()}/organizations`,
            ]);
          },
          error: (err) => {
            Swal.fire('Error!', 'Failed to delete organization.', 'error');
          },
        });
    }
  }

  // ==================== HELPER METHODS ====================
  private handleInvalidId(): void {
    this.router.navigate(['/not-found']);
  }

  private handleAccessDenied(): void {
    this.router.navigate(['/access-denied']);
    // Navigate back after a short delay or use browser history
    setTimeout(() => {
      this.location.back();
    }, 3000); // Navigate back after 3 seconds
  }
  private showError(message: string): void {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
    });
  }
}
