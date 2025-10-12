import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserDetailsInfoComponent } from './user-details-info/user-details-info.component';
import { LocationSectionComponent } from './location-section/location-section.component';
import { UserService } from '../../../services/user.service';
import { TaskService } from '../../../../../shared/services/task.service';
import { TaskContainerComponent } from '../../../../../shared/components/task-container/task-container.component';
import Swal from 'sweetalert2';
import { ShiftService } from '../../../services/shift.service';
import { Shift } from '../../../models/shift.model';
import { AttendanceService } from '../../../services/attendance.service';
import { AttendanceHistoryItem } from '../../../models/attendance.model';
import {
  TableAction,
  TableColumn,
  TableDataComponent,
} from '../../../../../shared/components/table-data/table-data.component';
import { LeaveService } from '../../../services/leave.service';
import { LeaveItem } from '../../../models/leave.model';
import { UserModel } from '../../../models/user.model';
import { TaskStatus } from '../../../../../shared/models/task.model';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthService } from '../../../../auth/services/auth.service';
import {
  getUserId,
  getUserRole,
} from '../../../../../core/helpers/auth.helpers';
import { LeaveOffcanvasComponent } from '../../leaves-management/leave-offcanvas/leave-offcanvas.component';
import { HistorySectionComponent } from './history-section/history-section.component';
import {
  formatDuration,
  parseUtcToLocal,
} from '../../../../../core/helpers/date-time.utils';

interface ExportOptions {
  location: boolean;
  tasks: boolean;
  shifts: boolean;
  attendance: boolean;
  leaves: boolean;
}

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    TranslateModule,
    CommonModule,
    UserDetailsInfoComponent,
    LocationSectionComponent,
    TaskContainerComponent,
    TableDataComponent,
    FormsModule,
    LeaveOffcanvasComponent,
    HistorySectionComponent,
  ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnInit {
  // Enums
  TaskStatus = TaskStatus;

  // Output Events
  @Output() tasksChanged = new EventEmitter<any>();
  @ViewChild('leaveOffcanvas') leaveOffcanvas!: LeaveOffcanvasComponent;

  // Component State
  selectedTab: string = 'location';
  userId: string | null = null;
  userLevelData: any | null = null;
  loading: boolean = false;
  error: string = '';
  myRole: string = getUserRole().toLocaleLowerCase(); // Initialize with helper function
  userRole: string = '';
  myId: string | null = getUserId(); // Initialize with helper function
  user: UserModel | null = null;
  isProfileMode: boolean = false;
  currentRoute: string = 'my-tasks';
  // Task State
  tasks: any[] = [];
  currentPage = 1;
  totalPages = 0;
  pageSize = 12;
  totalCount = 0;
  selectedFilters: any = {};
  selectedStatusValue: number | null = null;
  isStatusFilterActive: boolean = false;
  taskLoading: boolean = false;

  // shift
  shifts: Shift[] = [];
  shiftCurrentPage = 1;
  shiftTotalPages = 0;
  shiftPageSize = 10;
  shiftTotalCount = 0;
  shiftLoading: boolean = false;
  shiftFilters: any = {};

  // attendance
  attendanceHistory: AttendanceHistoryItem[] = [];
  attendanceCurrentPage = 1;
  attendanceTotalPages = 0;
  attendancePageSize = 10;
  attendanceTotalCount = 0;
  attendanceLoading: boolean = false;
  attendanceFilters: any = {};

  // leave
  leaveHistory: LeaveItem[] = [];
  leaveCurrentPage = 1;
  leaveTotalPages = 0;
  leavePageSize = 10;
  leaveTotalCount = 0;
  leaveLoading: boolean = false;
  leaveFilters: any = {};
  selectedLeave: any = null;

  // export
  showExportModal: boolean = false;
  exportAll: boolean = false;
  exportFormat: string = 'excel';
  exportOptions: ExportOptions = {
    location: false,
    tasks: false,
    shifts: false,
    attendance: false,
    leaves: false,
  };

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private taskService: TaskService,
    private shiftService: ShiftService,
    private attendanceService: AttendanceService,
    private leaveService: LeaveService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  // ==================== INITIALIZATION ====================
  private initializeComponent(): void {
    this.checkRouteMode();
    this.initializeUserData();

    if (this.isProfileMode) {
      this.loadProfileDetails();
    } else {
      this.initializeRouteParams();
    }
  }

  private checkRouteMode(): void {
    this.isProfileMode = this.router.url.includes('/profile');
  }

  private initializeRouteParams(): void {
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id');
      if (this.userId) {
        this.loadUserDetails();
        this.fetchUserLevel();
        this.setupQueryParamSubscription();
      }
    });
  }

  private initializeUserData(): void {
    // If in profile mode, set userId to current user's ID
    if (this.isProfileMode) {
      this.userId = this.myId;
    }
  }

  loadUserDetails(): void {
    this.loading = true;
    this.error = '';

    if (this.isProfileMode) {
      this.loadProfileDetails();
    } else {
      this.userService.getUserById(+this.userId!).subscribe({
        next: (user) => {
          this.user = user;
          this.userRole = user?.role.toLowerCase() || '';
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load user details';
          this.loading = false;
          console.error('Error loading user:', err);
        },
      });
    }
  }

  loadProfileDetails(): void {
    this.loading = true;
    this.error = '';

    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.user = {
            id: response.data.id,
            userName: response.data.userName,
            email: response.data.email,
            phoneNumber: response.data.phoneNumber,
            role: response.data.role,
            ...response.data,
          } as UserModel;

          this.userId = response.data.id?.toString();
          this.fetchUserLevel();
          this.setupQueryParamSubscription();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load profile details';
        this.loading = false;
        console.error('Error loading profile:', err);
      },
    });
  }

  // ==================== TAB MANAGEMENT ====================
  selectTab(tab: string): void {
    this.selectedTab = tab;
    if (tab === 'tasks' && this.userId) {
      this.loadTasks();
    }
    if (tab === 'shifts') {
      this.loadShifts();
    }
    if (tab === 'attendance' && this.userId) {
      this.loadAttendance();
    }
    if (tab === 'leaves' && this.userId) {
      this.loadLeaves();
    }
  }

  // ==================== TASK MANAGEMENT ====================
  loadTasks(): void {
    if (!this.userId) return;

    this.taskLoading = true;

    const filters: any = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      assignTo: +this.userId,
      ...this.selectedFilters,
    };

    this.taskService.getTasks(filters).subscribe({
      next: (response) => this.handleTaskResponse(response),
      error: (err) => this.handleTaskError(err),
    });
  }

  private handleTaskResponse(response: any): void {
    if (!response || !response.data) {
      console.error('Invalid API response structure:', response);
      this.handleErrorResponse();
      return;
    }

    this.tasks = response.data;
    this.currentPage = response.data.currentPage || 1;
    this.totalPages = response.data.totalPages || 0;
    this.totalCount = response.data.totalCount || 0;

    this.emitTaskData();
    this.taskLoading = false;
  }

  private handleTaskError(err: any): void {
    console.error('Failed to load tasks:', err);
    this.handleErrorResponse();
    this.taskLoading = false;
  }

  onStatusFilterChange(selectedOption: string): void {
    this.selectedFilters = { ...this.selectedFilters };
    delete this.selectedFilters.status;

    switch (selectedOption) {
      case 'opt1':
        break; // All tasks
      case 'opt2':
        this.selectedFilters.status = TaskStatus.Pending;
        break;
      case 'opt3':
        this.selectedFilters.status = TaskStatus.InProgress;
        break;
      case 'opt4':
        this.selectedFilters.status = TaskStatus.Completed;
        break;
      case 'opt5':
        this.selectedFilters.status = TaskStatus.NotResolved;
        break;
      case 'opt6':
        this.selectedFilters.status = TaskStatus.Overdue;
        break;
    }

    this.currentPage = 1;
    this.loadTasks();
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.loadTasks();
  }

  onPageSizeChanged(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadTasks();
  }

  onViewTask(task: any): void {
    const id = task?.id?.toString();
    if (id) {
      this.router.navigate(
        [`/${getUserRole().toLowerCase()}/task-details`, id],
        {
          queryParams: { fromRoute: this.currentRoute },
        }
      );
    }
  }
  onEditTask(task: any): void {
    this.router.navigate([
      `/${getUserRole().toLowerCase()}/edit-task`,
      task.id,
    ]);
  }

  async onDeleteTask(task: any): Promise<void> {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          Swal.fire('Deleted!', 'The task has been deleted.', 'success');
          this.loadTasks();
        },
        error: (err) => {
          console.error('Failed to delete task:', err);
          Swal.fire('Error!', 'Failed to delete the task.', 'error');
        },
      });
    }
  }

  // ==================== USER ACTIONS ====================
  async onEditProfile(): Promise<void> {
    if (this.isProfileMode) {
      this.router.navigate([`${getUserRole().toLowerCase()}`, 'edit-profile']);
    } else {
      this.router.navigate([
        getUserRole().toLowerCase(),
        'edit-user',
        this.userId,
      ]);
    }
  }

  async onDeleteUser(): Promise<void> {
    if (this.isProfileMode) {
      Swal.fire('Error!', 'You cannot delete your own profile.', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete User?',
      text: 'This will permanently delete the user and all associated data.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });

    if (result.isConfirmed) {
      try {
        Swal.fire('Deleted!', 'User has been deleted.', 'success');
        this.router.navigate(['/users']);
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete user.', 'error');
      }
    }
  }

  // ==================== USER LOCATION MANAGEMENT ====================
  private setupQueryParamSubscription(): void {
    this.route.queryParams.subscribe((params) => {
      this.handleStatusParam(params);
      this.handlePriorityParam(params);
      this.loadTasks();
    });
  }

  private handleStatusParam(params: any): void {
    if (params['status'] !== undefined) {
      this.selectedStatusValue = +params['status'];
      this.selectedFilters.status = this.selectedStatusValue;
      this.isStatusFilterActive = true;
    } else {
      this.isStatusFilterActive = false;
    }

    this.router.navigate([], {
      queryParams: { status: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private handlePriorityParam(params: any): void {
    if (params['priority'] !== undefined) {
      this.selectedFilters.priority = params['priority'];
    }
  }

  private handleErrorResponse(): void {
    this.tasks = [];
    this.currentPage = 1;
    this.totalPages = 0;
    this.totalCount = 0;
    this.emitTaskData();
  }

  private emitTaskData(): void {
    this.tasksChanged.emit(this.tasks || []);
  }

  fetchUserLevel(): void {
    this.loading = true;
    this.error = '';

    if (this.userId) {
      this.userService.getUserWorkLocation(+this.userId).subscribe({
        next: (response) => {
          this.loading = false;
          if (response) {
            this.userLevelData = response;
          } else {
            this.error = 'Failed to fetch user work location';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = 'An error occurred while fetching work location';
        },
      });
    } else {
      this.loading = false;
      this.error = 'User ID is missing';
    }
  }

  retryLoading(): void {
    if (this.isProfileMode) {
      this.loadProfileDetails();
    } else {
      this.fetchUserLevel();
    }
  }

  // ==================== NAVIGATION METHODS ====================
  navigateToArea(areaId: number): void {
    if (this.myRole === 'cleaner') return;
    this.router.navigate([
      `/${this.myRole.toLowerCase()}/area-details`,
      areaId,
    ]);
  }

  navigateToCity(cityId: number): void {
    if (this.myRole === 'cleaner') return;
    this.router.navigate([
      `/${this.myRole.toLowerCase()}/city-details`,
      cityId,
    ]);
  }

  navigateToBuilding(buildingId: number): void {
    if (this.myRole === 'cleaner') return;
    this.router.navigate([
      `/${this.myRole.toLowerCase()}/building-details`,
      buildingId,
    ]);
  }

  navigateToFloor(floorId: number): void {
    if (this.myRole === 'cleaner') return;
    this.router.navigate([
      `/${this.myRole.toLowerCase()}/floor-details`,
      floorId,
    ]);
  }

  navigateToSection(sectionId: number): void {
    if (this.myRole === 'cleaner') return;
    this.router.navigate([
      `/${this.myRole.toLowerCase()}/section-details`,
      sectionId,
    ]);
  }

  navigateToPoint(pointId: number): void {
    if (this.myRole === 'cleaner') return;
    this.router.navigate([
      `/${this.myRole.toLowerCase()}/point-details`,
      pointId,
    ]);
  }

  hasExportableData(): boolean {
    return (
      this.userLevelData &&
      (this.userLevelData.areas?.length > 0 ||
        this.userLevelData.cities?.length > 0 ||
        this.userLevelData.organizations?.length > 0 ||
        this.userLevelData.buildings?.length > 0 ||
        this.userLevelData.floors?.length > 0 ||
        this.userLevelData.points?.length > 0)
    );
  }

  // ==================== Shift MANAGEMENT ====================

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
      condition: (_, role) =>
        role === 'admin' || role === 'manager' || role === 'supervisor',
    },
    {
      icon: 'fas fa-edit',
      label: 'Edit Shift',
      action: (shift) => this.navigateToEditShift(shift.id),
      condition: (_, role) => role === 'admin' || role === 'manager',
    },
  ];

  navigateToShiftDetails(shiftId: number): void {
    this.router.navigate([
      `/${getUserRole().toLowerCase()}/shift-details`,
      shiftId,
    ]);
  }

  navigateToEditShift(shiftId: number): void {
    this.router.navigate([
      `/${getUserRole().toLowerCase()}/edit-shift`,
      shiftId,
    ]);
  }

  loadShifts(): void {
    const userId = this.isProfileMode ? getUserId() : this.userId;
    console.log(this.userId);

    if (!userId) return;

    this.shiftLoading = true;

    const numericUserId = +userId;

    this.shiftService.getUserShifts(numericUserId).subscribe({
      next: (response) => this.handleShiftResponse(response),
      error: (err) => this.handleShiftError(err),
    });
  }

  private handleShiftResponse(response: any): void {
    if (!response || !response.data) {
      console.error('Invalid API response structure:', response);
      this.handleShiftErrorResponse();
      return;
    }

    this.shifts = response.data || [];
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

  // ==================== Attendance MANAGEMENT ====================
  attendanceTableColumns: TableColumn[] = [
    { key: 'date', label: 'ATTENDANCE.DATE', type: 'text' },
    { key: 'clockIn', label: 'ATTENDANCE.CLOCK_IN', type: 'date' },
    { key: 'clockOut', label: 'ATTENDANCE.CLOCK_OUT', type: 'date' },
    { key: 'duration', label: 'ATTENDANCE.DURATION', type: 'text' },
    { key: 'status', label: 'ATTENDANCE.STATUS', type: 'text' },
  ];

  attendanceTableActions: TableAction[] = [];

  loadAttendance(): void {
    if (!this.userId) return;

    this.attendanceLoading = true;

    const filters: any = {
      PageNumber: this.attendanceCurrentPage,
      PageSize: this.attendancePageSize,
      UserId: +this.userId,
      History: this.isProfileMode,
      ...this.attendanceFilters,
    };

    this.attendanceService.getAttendanceHistory(filters).subscribe({
      next: (response) => this.handleAttendanceResponse(response),
      error: (err) => this.handleAttendanceError(err),
    });
  }

  private handleAttendanceResponse(response: any): void {
    if (!response || !response.data) {
      console.error('Invalid API response structure:', response);
      this.handleAttendanceErrorResponse();
      return;
    }

    this.attendanceHistory = (response.data.data || []).map((item: any) => ({
      ...item,
      clockIn: parseUtcToLocal(item.clockIn),
      clockOut: parseUtcToLocal(item.clockOut),
      duration: formatDuration(item.duration),
    }));

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
      [`/${getUserRole().toLowerCase()}/attendance-details`, item.userId],
      { state: { attendanceData: item } }
    );
  }

  editAttendance(item: AttendanceHistoryItem): void {
    this.router.navigate(
      [`/${getUserRole().toLowerCase()}/edit-attendance`, item.userId],
      { state: { attendanceData: item } }
    );
  }

  // ==================== Leave MANAGEMENT ====================
  leaveTableColumns: TableColumn[] = [
    { key: 'startDate', label: 'LEAVE.START_DATE', type: 'date' },
    { key: 'endDate', label: 'LEAVE.END_DATE', type: 'date' },
    { key: 'type', label: 'LEAVE.TYPE', type: 'text' },
    { key: 'status', label: 'LEAVE.STATUS', type: 'text' },
  ];

  leaveTableActions: TableAction[] = [
    {
      icon: 'fas fa-eye',
      label: 'View Leave Details',
      action: (item) => this.viewLeaveDetails(item),
      condition: () => true,
    },
    {
      icon: 'fas fa-edit',
      label: 'Edit Leave',
      action: (item) => this.editLeave(item),
      condition: (item, role) =>
        role === 'admin' ||
        role === 'manager' ||
        role === 'supervisor' ||
        role === 'cleaner' ||
        item.status === 'Pending',
    },
    {
      icon: 'fas fa-trash-alt',
      label: 'Delete Leave',
      action: (item) => this.deleteLeave(item),
      condition: (_, role) => role === 'Admin' || role === 'Manager',
    },
  ];

  loadLeaves(): void {
    if (!this.userId) return;

    this.leaveLoading = true;

    const filters: any = {
      PageNumber: this.leaveCurrentPage,
      PageSize: this.leavePageSize,
      UserId: +this.userId,
      History: this.isProfileMode,
      ...this.leaveFilters,
    };

    this.leaveService.getLeavesWithPagination(filters).subscribe({
      next: (response) => this.handleLeaveResponse(response),
      error: (err) => this.handleLeaveError(err),
    });
  }

  // ==================== Leave Offcanvas Methods ====================
  openAddLeaveOffcanvas(): void {
    this.selectedLeave = null;
    this.leaveOffcanvas.resetForm();

    // Set the userId for the leave if we're in user details mode (not profile mode)
    if (!this.isProfileMode && this.userId) {
      this.leaveOffcanvas.leaveData.userId = this.userId;
    }

    // Show the offcanvas
    const offcanvasElement = document.getElementById('leaveOffcanvas');
    if (offcanvasElement) {
      const bsOffcanvas = new (window as any).bootstrap.Offcanvas(
        offcanvasElement
      );
      bsOffcanvas.show();
    }
  }

  editLeave(item: LeaveItem): void {
    this.selectedLeave = item;

    // Show the offcanvas
    const offcanvasElement = document.getElementById('leaveOffcanvas');
    if (offcanvasElement) {
      const bsOffcanvas = new (window as any).bootstrap.Offcanvas(
        offcanvasElement
      );
      bsOffcanvas.show();
    }
  }

  handleLeaveUpdated(): void {
    this.loadLeaves();
    this.selectedLeave = null;

    // Hide the offcanvas
    const offcanvasElement = document.getElementById('leaveOffcanvas');
    if (offcanvasElement) {
      const bsOffcanvas = (window as any).bootstrap.Offcanvas.getInstance(
        offcanvasElement
      );
      if (bsOffcanvas) {
        bsOffcanvas.hide();
      }
    }
  }

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
      [`/${getUserRole().toLowerCase()}/leave-details`, item.id],
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

  // ==================== Export logic ====================
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
      location: false,
      tasks: false,
      shifts: false,
      attendance: false,
      leaves: false,
    };
  }

  toggleExportAll(): void {
    if (this.exportAll) {
      this.exportOptions = {
        location: this.hasExportableData(),
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
    if (!this.userId) return;

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
      userId: +this.userId,
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

    if (this.exportOptions.location && this.userLevelData) {
      const locationData = this.prepareLocationData();
      const ws = XLSX.utils.json_to_sheet(locationData);
      XLSX.utils.book_append_sheet(workbook, ws, 'Location');
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

    const fileName = this.isProfileMode
      ? 'my_profile_data.xlsx'
      : `user_data_${this.userId}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  private exportToPDF(): void {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(16);
    doc.setTextColor(33, 37, 41);
    const title = this.isProfileMode
      ? 'My Profile Report'
      : `User Report: ${this.user?.userName || 'Unknown'}`;
    doc.text(title, 105, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, yPos, {
      align: 'center',
    });
    yPos += 15;

    if (this.exportOptions.location && this.userLevelData) {
      const locationData = this.prepareLocationData();
      if (locationData.length) {
        this.addTableToPDF(doc, 'Location Data', locationData, yPos);
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }
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

    const fileName = this.isProfileMode
      ? 'my_profile_report.pdf'
      : `user_${this.userId}_report.pdf`;
    doc.save(fileName);
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

  private prepareLocationData(): any[] {
    if (!this.userLevelData) return [];

    const locationData = [];

    if (this.userLevelData.areas?.length) {
      locationData.push(
        ...this.userLevelData.areas.map((area: any) => ({
          Type: 'Area',
          Name: area.name,
          Description: area.description || 'N/A',
        }))
      );
    }

    if (this.userLevelData.cities?.length) {
      locationData.push(
        ...this.userLevelData.cities.map((city: any) => ({
          Type: 'City',
          Name: city.name,
          Description: city.description || 'N/A',
        }))
      );
    }

    if (this.userLevelData.buildings?.length) {
      locationData.push(
        ...this.userLevelData.buildings.map((building: any) => ({
          Type: 'Building',
          Name: building.name,
          Description: building.description || 'N/A',
        }))
      );
    }

    if (this.userLevelData.floors?.length) {
      locationData.push(
        ...this.userLevelData.floors.map((floor: any) => ({
          Type: 'Floor',
          Name: floor.name,
          Description: floor.description || 'N/A',
        }))
      );
    }

    if (this.userLevelData.points?.length) {
      locationData.push(
        ...this.userLevelData.points.map((point: any) => ({
          Type: 'Point',
          Name: point.name,
          Description: point.description || 'N/A',
        }))
      );
    }

    return locationData;
  }
}
