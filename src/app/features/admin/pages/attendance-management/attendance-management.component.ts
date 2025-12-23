// ==================== ANGULAR CORE & COMMON MODULES ====================
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// ==================== THIRD-PARTY LIBRARIES ====================
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';

// ==================== SERVICES & MODELS ====================
import { AttendanceService } from '../../services/attendance.service';
import { AttendanceHistoryItem } from '../../models/attendance.model';

// ==================== CUSTOM COMPONENTS ====================
import {
  TableDataComponent,
  TableColumn,
  TableAction,
} from '../../../../shared/components/table-data/table-data.component';
import { ReusableFilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { AttendanceFilterComponent } from '../../../../shared/components/filters/attendance-filter/attendance-filter.component';
import { PageTitleComponent } from '../../../../shared/components/page-title/page-title.component';

// ==================== HELPERS ====================
import { getUserRole } from '../../../../core/helpers/auth.helpers';
import {
  formatDuration,
  parseUtcToLocal,
} from '../../../../core/helpers/date-time.utils';
import {
  ExportConfig,
  ExportService,
} from '../../../../shared/services/export.service';
import { AttendanceReportService } from '../../../../shared/services/pdf-services/attendance/attendance.service';

/**
 * Attendance Management Component
 * - Handles attendance tracking, history, and reporting
 * - Supports filtering by date, user, status, etc.
 * - Provides export functionality (PDF, Excel)
 * - Designed as standalone component for modularity
 */
@Component({
  selector: 'app-attendance-management',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableDataComponent,
    ReusableFilterBarComponent,
    AttendanceFilterComponent,
    PageTitleComponent,
  ],
  templateUrl: './attendance-management.component.html',
  styleUrls: ['./attendance-management.component.scss'],
})
export class AttendanceManagementComponent {
  // ==================== STATE & UI PROPERTIES ====================
  searchData: string = '';
  filterData: any = {};
  showFilterModal: boolean = false;
  isGeneratingPDF: boolean = false;
  isGeneratingExcel: boolean = false;

  // Pagination properties
  attendanceHistory: AttendanceHistoryItem[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'userName', label: 'ATTENDANCE.USER', type: 'text' },
    { key: 'role', label: 'ATTENDANCE.ROLE', type: 'text' },
    { key: 'date', label: 'ATTENDANCE.DATE', type: 'text' },
    { key: 'clockIn', label: 'ATTENDANCE.CLOCK_IN', type: 'date' },
    { key: 'clockOut', label: 'ATTENDANCE.CLOCK_OUT', type: 'date' },
    { key: 'duration', label: 'ATTENDANCE.DURATION', type: 'text' },
    { key: 'status', label: 'ATTENDANCE.STATUS', type: 'text' },
  ];

  // Table actions
  tableActions: TableAction[] = [];

  // ==================== CONSTRUCTOR ====================
  constructor(
    private router: Router,
    private attendanceService: AttendanceService,
    private attendanceReportService: AttendanceReportService,
    private exportService: ExportService // Inject ExportService
  ) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.loadAttendanceHistory();
  }

  // ==================== DATA LOADING ====================

  /**
   * Load attendance history with current filters & pagination
   */
  loadAttendanceHistory(): void {
    const filters = this.buildFilters();
    this.attendanceService.getAttendanceHistory(filters).subscribe({
      next: (response) => {
        if (response && response.succeeded) {
          this.updateAttendanceData(response.data);
        } else {
          // Handle empty or failed response
          this.resetAttendanceData();
        }
      },
      error: (error) => {
        console.error('Error loading attendance history:', error);
        this.showError('Failed to load attendance data. Please try again.');
        this.resetAttendanceData();
      },
    });
  }

  /**
   * Reset attendance data to empty state
   */
  private resetAttendanceData(): void {
    this.attendanceHistory = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalCount = 0;
  }

  /**
   * Update component state with paginated data
   */
  private updateAttendanceData(data: any): void {
    this.attendanceHistory = (data.data || []).map((item: any) => ({
      ...item,
      clockIn: parseUtcToLocal(item.clockIn),
      clockOut: parseUtcToLocal(item.clockOut),
      duration: formatDuration(item.duration),
    }));
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    this.totalCount = data.totalCount;
    this.pageSize = data.pageSize;
  }

  // ==================== EVENT HANDLERS ====================

  onSearchChange(searchTerm: string): void {
    this.searchData = searchTerm;
    this.currentPage = 1;
    this.loadAttendanceHistory();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = { ...filterObj };
    this.currentPage = 1;
    this.loadAttendanceHistory();
    this.showFilterModal = false;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadAttendanceHistory();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size || 10;
    this.currentPage = 1;
    this.loadAttendanceHistory();
  }

  // ==================== EXPORT & PRINT ====================

  /**
   * Download filtered attendance data as PDF
   * Now fetches data directly from API via service
   */
  downloadAsPDF(): void {
    this.isGeneratingPDF = true;

    // Pass current filters to the PDF service
    this.attendanceReportService
      .generateAttendancePDF({
        fileName: `attendance_history_${
          new Date().toISOString().split('T')[0]
        }`,
        pdfTitle: 'Attendance History Report',
        includeCoverPage: true,
        reportInfo: {
          reportDate: new Date(),
          preparedBy: this.currentUserRole || 'Attendance System',
          period: this.getDateRangeText(),
        },
        // Pass current filters so the service can fetch filtered data
        filters: this.buildFilters(),
      })
      .subscribe({
        next: () => {
          this.isGeneratingPDF = false;
          this.showSuccess('PDF generated and downloaded successfully.');
        },
        error: (error) => {
          this.isGeneratingPDF = false;
          console.error('Error generating PDF:', error);
          this.showError('Failed to generate PDF. Please try again.');
        },
      });
  }

  /**
   * Quick PDF generation (simplified version)
   */
  quickDownloadPDF(): void {}

  /**
   * Download as Excel using current component data
   */
  downloadAsExcel(): void {
    this.isGeneratingExcel = true;

    const exportConfig: ExportConfig = {
      fileName: `attendance_history_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Attendance History',
      headers: [
        'User',
        'Role',
        'Date',
        'Clock In',
        'Clock Out',
        'Duration',
        'Status',
        'Shift Name',
      ],
      data: this.attendanceHistory,
      columnKeys: [
        'userName',
        'role',
        'date',
        'clockIn',
        'clockOut',
        'duration',
        'status',
        'shiftName',
      ],
    };

    this.exportService.exportToExcel(exportConfig);
    this.isGeneratingExcel = false;
    this.showSuccess('Excel file downloaded successfully.');
  }

  /**
   * Print PDF using current component data
   */
  printPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'attendance_history',
      headers: [
        'User',
        'Role',
        'Date',
        'Clock In',
        'Clock Out',
        'Duration',
        'Status',
        'Shift Name',
      ],
      data: this.attendanceHistory.map((item) => ({
        ...item,
        startShift: item.startShift || '03:25:00',
        endShift: item.endShift || '23:55:00',
      })),
      columnKeys: [
        'userName',
        'role',
        'date',
        'clockIn',
        'clockOut',
        'duration',
        'status',
        'shiftName',
      ],
      pdfTitle: 'Attendance History Report',
    };

    this.exportService.printPDF(exportConfig);
  }

  /**
   * Quick Excel export
   */
  quickDownloadExcel(): void {
    const tableData = this.attendanceHistory.map((item) => [
      item.userName,
      item.role,
      item.date,
      item.clockIn,
      item.clockOut || 'N/A',
      item.duration || 'N/A',
      item.status,
      item.shiftName,
    ]);

    this.exportService.quickExcel(
      `attendance_quick_${new Date().toISOString().split('T')[0]}`,
      [
        'User',
        'Role',
        'Date',
        'Clock In',
        'Clock Out',
        'Duration',
        'Status',
        'Shift Name',
      ],
      tableData
    );

    this.showInfo('Quick Excel report downloaded.');
  }

  // ==================== ATTENDANCE ACTIONS ====================

  viewAttendanceDetails(item: AttendanceHistoryItem): void {
    this.router.navigate(
      [`/${this.getBaseRouteByRole()}/attendance-details/${item.userId}`],
      {
        state: { attendanceData: item },
      }
    );
  }

  editAttendance(item: AttendanceHistoryItem): void {
    this.router.navigate(
      [`/${this.getBaseRouteByRole()}/edit-attendance/${item.userId}`],
      {
        state: { attendanceData: item },
      }
    );
  }

  // ==================== HELPER METHODS ====================

  isAdminOrManager(): boolean {
    return (
      this.currentUserRole === 'Admin' || this.currentUserRole === 'Manager'
    );
  }

  /**
   * Build filters for API calls
   */
  private buildFilters(): any {
    const f = this.filterData;
    return {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      Search: this.searchData || '',
      UserId: f.selectedUser,
      StartDate: f.startDate,
      EndDate: f.endDate,
      Status: f.selectedStatus,
      RoleId: f.selectedRole,
      AreaId: f.selectedArea,
      CityId: f.selectedCity,
      OrganizationId: f.selectedOrganization,
      BuildingId: f.selectedBuilding,
      FloorId: f.selectedFloor,
      SectionId: f.selectedSection,
      PointId: f.selectedPoint,
      ProviderId: f.selectedProvider,
      History: true, // For history view
    };
  }

  /**
   * Get readable date range text for report
   */
  private getDateRangeText(): string {
    const f = this.filterData;
    if (f.startDate && f.endDate) {
      return `${f.startDate} to ${f.endDate}`;
    } else if (f.startDate) {
      return `From ${f.startDate}`;
    } else if (f.endDate) {
      return `Until ${f.endDate}`;
    }
    return 'All dates';
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      timer: 3000,
      showConfirmButton: false,
    });
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  }

  /**
   * Show info message
   */
  private showInfo(message: string): void {
    Swal.fire({
      icon: 'info',
      title: 'Info',
      text: message,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
    });
  }

  /**
   * Get base route based on user role
   */
  private getBaseRouteByRole(): string {
    const roles: Record<string, string> = {
      Admin: 'admin',
      Manager: 'manager',
      Supervisor: 'supervisor',
      Cleaner: 'cleaner',
    };
    return roles[this.currentUserRole] || 'admin';
  }

  /**
   * Open filter modal
   */
  openFilterModal(): void {
    this.showFilterModal = true;
  }

  /**
   * Close filter modal
   */
  closeFilterModal(): void {
    this.showFilterModal = false;
  }
}
