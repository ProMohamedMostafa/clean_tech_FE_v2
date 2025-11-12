// ==================== ANGULAR CORE & COMMON MODULES ====================
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// ==================== THIRD-PARTY LIBRARIES ====================
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';

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
import {
  ExportConfig,
  ExportService,
} from '../../../../../shared/services/export.service';

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
    private pointService: PointService,
    private exportService: ExportService // Inject ExportService
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
    const exportConfig: ExportConfig = {
      fileName: 'points',
      headers: ['Name', 'Section', 'Floor', 'Building'],
      data: this.points,
      columnKeys: ['name', 'sectionName', 'floorName', 'buildingName'],
      pdfTitle: 'Points List',
      pdfOrientation: 'landscape',
    };

    this.exportService.exportToPDF(exportConfig);
  }

  downloadAsExcel(): void {
    const exportConfig: ExportConfig = {
      fileName: 'points',
      sheetName: 'Points',
      headers: ['Name', 'Section', 'Floor', 'Building'],
      data: this.points,
      columnKeys: ['name', 'sectionName', 'floorName', 'buildingName'],
    };

    this.exportService.exportToExcel(exportConfig);
  }

  printPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'points',
      headers: ['Name', 'Section', 'Floor', 'Building'],
      data: this.points,
      columnKeys: ['name', 'sectionName', 'floorName', 'buildingName'],
      pdfTitle: 'Points List',
      pdfOrientation: 'landscape',
    };

    this.exportService.printPDF(exportConfig);
  }

  // ==================== QUICK EXPORT METHODS ====================

  /** Quick export using simplified methods */
  quickDownloadPDF(): void {
    const tableData = this.points.map((point) => [
      point.name,
      point.sectionName,
      point.floorName,
      point.buildingName,
    ]);

    this.exportService.quickPDF(
      'points',
      ['Name', 'Section', 'Floor', 'Building'],
      tableData
    );
  }

  quickDownloadExcel(): void {
    const tableData = this.points.map((point) => [
      point.name,
      point.sectionName,
      point.floorName,
      point.buildingName,
    ]);

    this.exportService.quickExcel(
      'points',
      ['Name', 'Section', 'Floor', 'Building'],
      tableData
    );
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
