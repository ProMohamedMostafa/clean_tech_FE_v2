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
import { PointService } from '../../../services/work-location/point.service';
import {
  Point,
  PointPaginationData,
} from '../../../models/work-location/point.model';

// ==================== CUSTOM COMPONENTS ====================
import {
  TableDataComponent,
  TableColumn,
  TableAction,
} from '../../../../../shared/components/table-data/table-data.component';
import { PointFilterComponent } from '../../../../../shared/components/filters/work-location/point-filter/point-filter.component';
import { ReusableFilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';

// ==================== HELPERS ====================
import { getUserRole } from '../../../../../core/helpers/auth.helpers';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';

/**
 * Point Management Component
 * - Handles listing points, pagination, filtering, CRUD actions
 * - Supports PDF & Excel export
 * - Designed as standalone component for modularity
 */
@Component({
  selector: 'app-point-management',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableDataComponent,
    PointFilterComponent,
    ReusableFilterBarComponent,
    PageTitleComponent,
  ],
  templateUrl: './point-management.component.html',
  styleUrls: ['./point-management.component.scss'],
})
export class PointManagementComponent {
  // ==================== STATE & UI PROPERTIES ====================
  searchData: string = '';
  filterData: any = {};
  showFilterModal: boolean = false;

  // Pagination properties
  points: Point[] = [];
  currentPage: number = 1;
  pageSize: number | undefined = 5;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'work-location.table.POINT_NAME', type: 'text' },
    { key: 'sectionName', label: 'work-location.table.SECTION', type: 'text' },
    { key: 'floorName', label: 'work-location.table.FLOOR', type: 'text' },
    {
      key: 'buildingName',
      label: 'work-location.table.BUILDING',
      type: 'text',
    },
  ];

  // Table actions with role-based conditions
  tableActions: TableAction[] = [
    {
      icon: 'fas fa-edit',
      label: 'actions.EDIT', // 🔑 translation key
      action: (point) => this.openEditModal(point),
      condition: (_, role) => role === 'Admin',
    },
    {
      icon: 'fas fa-eye',
      label: 'actions.VIEW_DETAILS', // 🔑 translation key
      action: (point) => this.navigateToPointDetails(point.id),
      condition: () => true,
    },
    {
      icon: 'fas fa-trash-alt',
      label: 'actions.DELETE', // 🔑 translation key
      action: (point) => this.deletePoint(point),
      condition: (_, role) => role === 'Admin',
    },
  ];

  selectedFloor: string | null = null;
  selectedSection: string | null = null;

  // ==================== CONSTRUCTOR ====================
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pointService: PointService
  ) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.handleSectionIdParam();
    this.loadPaginatedPoints();
  }

  // ==================== DATA LOADING ====================

  /**
   * Load points with current filters & pagination
   */
  loadPaginatedPoints(): void {
    const filters = this.buildFilters();
    this.pointService.getPointsPaged(filters).subscribe({
      next: (data) => {
        this.updatePointData(data);
      },
    });
  }

  /**
   * Update component state with paginated data
   */
  private updatePointData(data: PointPaginationData): void {
    this.points = data.data;
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    this.totalCount = data.totalCount;
    this.pageSize = data.pageSize;
  }

  // ==================== EVENT HANDLERS ====================

  onSearchChange(searchTerm: string): void {
    this.searchData = searchTerm;
    this.currentPage = 1;
    this.loadPaginatedPoints();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = { ...filterObj };
    this.currentPage = 1;
    this.loadPaginatedPoints();
    this.showFilterModal = false;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadPaginatedPoints();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadPaginatedPoints();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Section', 'Floor', 'Building']],
      body: this.points.map((p) => [
        p.name,
        p.sectionName,
        p.floorName,
        p.buildingName,
      ]),
    });
    doc.save('points.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.points.map((p) => ({
        Name: p.name,
        Section: p.sectionName,
        Floor: p.floorName,
        Building: p.buildingName,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Points');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'points.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Section', 'Floor', 'Building']],
      body: this.points.map((p) => [
        p.name,
        p.sectionName,
        p.floorName,
        p.buildingName,
      ]),
    });
    const pdfWindow = window.open(doc.output('bloburl'), '_blank');
    pdfWindow?.focus();
    pdfWindow?.print();
  }

  // ==================== POINT ACTIONS ====================

  openEditModal(point: Point): void {
    this.router.navigate(['admin', 'edit-point', point.id]);
  }

  navigateToPointDetails(id: number): void {
    this.router.navigate([`/${this.getBaseRouteByRole()}/point-details/${id}`]);
  }

  navigateToAddPoint(): void {
    this.router.navigate(['/admin/add-point']);
  }

  navigateToDeletedPoints(): void {
    this.router.navigate(['admin', 'deleted-points']);
  }

  deletePoint(point: Point): void {
    if (!point.id) {
      console.error('Point ID missing');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `Delete point ${point.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.pointService.softDeletePoint(point.id).subscribe({
          next: () => {
            this.showSuccess(`Deleted ${point.name}.`);
            this.loadPaginatedPoints();
          },
        });
      }
    });
  }

  // ==================== HELPER METHODS ====================

  private handleSectionIdParam(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['sectionId']) {
        this.onFilterApplied({ selectedSection: params['sectionId'] });
        // Remove sectionId from URL
        this.router.navigate([], {
          queryParams: { sectionId: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }

  isAdmin(): boolean {
    return this.currentUserRole === 'Admin';
  }

  private buildFilters(): any {
    const f = this.filterData;
    return {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      SearchQuery: this.searchData || '',
      sectionId: f.selectedSection,
      floorId: f.selectedFloor,
    };
  }

  private showError(message: string): void {
    Swal.fire({ icon: 'error', title: 'Error', text: message });
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
}
