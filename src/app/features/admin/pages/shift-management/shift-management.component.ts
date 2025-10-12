// ==================== ANGULAR CORE & COMMON MODULES ====================
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// ==================== THIRD-PARTY LIBRARIES ====================
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

// ==================== SERVICES & MODELS ====================
import { ShiftService } from '../../services/shift.service';
import { Shift } from '../../models/shift.model';

// ==================== CUSTOM COMPONENTS ====================
import {
  TableDataComponent,
  TableColumn,
  TableAction,
} from '../../../../shared/components/table-data/table-data.component';
import { ShiftFilterComponent } from '../../../../shared/components/filters/shift-filter/shift-filter.component';
import { ReusableFilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { PageTitleComponent } from '../../../../shared/components/page-title/page-title.component';

// ==================== HELPERS ====================
import { getUserRole } from '../../../../core/helpers/auth.helpers';
import { DailyCalendarComponent } from '../../../../shared/components/daily-calendar/daily-calendar.component';

/**
 * Shift Management Component
 * - Handles listing shifts, pagination, filtering, CRUD actions
 * - Supports PDF & Excel export
 * - Designed as standalone component for modularity
 */
@Component({
  selector: 'app-shift-management',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableDataComponent,
    ShiftFilterComponent,
    ReusableFilterBarComponent,
    PageTitleComponent,
    DailyCalendarComponent,
  ],
  templateUrl: './shift-management.component.html',
  styleUrls: ['./shift-management.component.scss'],
})
export class ShiftManagementComponent {
  // ==================== STATE & UI PROPERTIES ====================
  searchData: string = '';
  filterData: any = {};
  showFilterModal: boolean = false;

  // Pagination properties
  shifts: Shift[] = [];
  currentPage: number = 1;
  pageSize: number | undefined = 5;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'ShiftTABLE.NAME', type: 'text' },
    { key: 'startDate', label: 'ShiftTABLE.START_DATE', type: 'text' },
    { key: 'endDate', label: 'ShiftTABLE.END_DATE', type: 'text' },
    { key: 'startTime', label: 'ShiftTABLE.START_TIME', type: 'text' },
    { key: 'endTime', label: 'ShiftTABLE.END_TIME', type: 'text' },
  ];

  // Table actions with role-based conditions
  tableActions: TableAction[] = [
    {
      icon: 'fas fa-edit',
      label: 'actions.EDIT', // 🔑 translation key
      action: (shift) => this.openEditModal(shift),
      condition: (_, role) => role === 'Admin',
    },
    {
      icon: 'fas fa-eye',
      label: 'actions.VIEW_DETAILS', // 🔑 translation key
      action: (shift) => this.navigateToShiftDetails(shift.id),
      condition: () => true,
    },
    {
      icon: 'fas fa-trash-alt',
      label: 'actions.DELETE', // 🔑 translation key
      action: (shift) => this.deleteShift(shift),
      condition: (_, role) => role === 'Admin',
    },
  ];

  // ==================== CONSTRUCTOR ====================
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shiftService: ShiftService
  ) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.loadPaginatedShifts();
  }

  // ==================== DATA LOADING ====================

  /**
   * Load shifts with current filters & pagination
   */
  loadPaginatedShifts(): void {
    const filters = this.buildFilters();
    this.shiftService.getPaginatedShifts(filters).subscribe((response) => {
      if (response && response.succeeded) {
        this.updateShiftData(response.data);
      }
    });
  }

  /**
   * Update component state with paginated data
   */
  private updateShiftData(data: any): void {
    this.shifts = data.data || [];
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    this.totalCount = data.totalCount;
    this.pageSize = data.pageSize;
  }

  // ==================== EVENT HANDLERS ====================

  onSearchChange(searchTerm: string): void {
    this.searchData = searchTerm;
    this.currentPage = 1;
    this.loadPaginatedShifts();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = { ...filterObj };
    this.currentPage = 1;
    this.loadPaginatedShifts();
    this.showFilterModal = false;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadPaginatedShifts();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadPaginatedShifts();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Start Time', 'End Time', 'Duration', 'Location']],
      body: this.shifts.map((s) => [s.name, s.startTime, s.endTime]),
    });
    doc.save('shifts.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.shifts.map((s) => ({
        Name: s.name,
        'Start Time': s.startTime,
        'End Time': s.endTime,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Shifts');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'shifts.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Start Time', 'End Time', 'Duration', 'Location']],
      body: this.shifts.map((s) => [s.name, s.startTime, s.endTime]),
    });
    const pdfWindow = window.open(doc.output('bloburl'), '_blank');
    pdfWindow?.focus();
    pdfWindow?.print();
  }

  // ==================== SHIFT ACTIONS ====================

  openEditModal(shift: any): void {
    this.router.navigate(['admin', 'edit-shift', shift.id]);
  }

  navigateToShiftDetails(id: any): void {
    this.router.navigate([`/${this.getBaseRouteByRole()}/shift-details/${id}`]);
  }

  navigateToAddShift(): void {
    this.router.navigate(['/admin/add-shift']);
  }

  navigateToDeletedShifts(): void {
    this.router.navigate(['admin', 'deleted-shifts']);
  }

  deleteShift(shift: Shift): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete shift ${shift.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.shiftService.deleteShift(shift.id).subscribe((res) => {
          this.showSuccess(res.message);
          this.loadPaginatedShifts();
        });
      }
    });
  }

  // ==================== HELPER METHODS ====================

  isAdmin(): boolean {
    return this.currentUserRole === 'Admin';
  }

  private buildFilters(): any {
    const f = this.filterData;
    return {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchData || '',
      area: f.selectedArea,
      city: f.selectedCity,
      organization: f.selectedOrganization,
      building: f.selectedBuilding,
      floor: f.selectedFloor,
      section: f.selectedSection,
      point: f.selectedPoint,
      startDate: f.startDate,
      endDate: f.endDate,
      startTime: f.startTime,
      endTime: f.endTime,
    };
  }

  private showSuccess(message: string): void {
    Swal.fire({ icon: 'success', title: 'Success', text: message });
  }

  private getBaseRouteByRole(): string {
    const roles: Record<string, string> = {
      Admin: 'admin',
      Manager: 'manager',
      Supervisor: 'supervisor',
      Cleaner: 'cleaner',
    };
    return roles[this.currentUserRole] || 'admin';
  }

  openFilterModal(): void {
    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  onDateSelected(dateString: string): void {
    const selectedDate = new Date(dateString);
    this.filterData = {
      ...this.filterData,
      startDate: dateString,
      endDate: dateString,
    };
    this.loadPaginatedShifts();
  }
}
