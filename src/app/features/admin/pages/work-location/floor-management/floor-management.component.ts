// ==================== ANGULAR CORE & COMMON MODULES ====================
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// ==================== THIRD-PARTY LIBRARIES ====================
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';

// ==================== SERVICES & MODELS ====================
import { FloorService } from '../../../services/work-location/floor.service';
import {
  Floor,
  FloorPaginationData,
} from '../../../models/work-location/floor.model';

// ==================== CUSTOM COMPONENTS ====================
import {
  TableDataComponent,
  TableColumn,
  TableAction,
} from '../../../../../shared/components/table-data/table-data.component';
import { FloorFilterComponent } from '../../../../../shared/components/filters/work-location/floor-filter/floor-filter.component';
import { ReusableFilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';

// ==================== HELPERS ====================
import { getUserRole } from '../../../../../core/helpers/auth.helpers';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';
import {
  ExportConfig,
  ExportService,
} from '../../../../../shared/services/export.service';

/**
 * Floor Management Component
 * - Handles listing floors, pagination, filtering, CRUD actions
 * - Supports PDF & Excel export
 * - Designed as standalone component for modularity
 */
@Component({
  selector: 'app-floor-management',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableDataComponent,
    FloorFilterComponent,
    ReusableFilterBarComponent,
    PageTitleComponent,
  ],
  templateUrl: './floor-management.component.html',
  styleUrls: ['./floor-management.component.scss'],
})
export class FloorManagementComponent {
  // ==================== STATE & UI PROPERTIES ====================
  searchData: string = '';
  filterData: any = {};
  showFilterModal: boolean = false;

  // Pagination properties
  floors: Floor[] = [];
  currentPage: number = 1;
  pageSize: number | undefined = 5;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'work-location.table.FLOOR', type: 'text' },
    {
      key: 'buildingName',
      label: 'work-location.table.BUILDING',
      type: 'text',
    },
    {
      key: 'organizationName',
      label: 'work-location.table.ORGANIZATION',
      type: 'text',
    },
    { key: 'cityName', label: 'work-location.table.CITY', type: 'text' },
  ];

  // Table actions with role-based conditions
  tableActions: TableAction[] = [
    {
      icon: 'fas fa-edit',
      label: 'actions.EDIT', // 🔑 translation key
      action: (floor) => this.openEditModal(floor),
      condition: (_, role) => role === 'Admin',
    },
    {
      icon: 'fas fa-eye',
      label: 'actions.VIEW_DETAILS', // 🔑 translation key
      action: (floor) => this.navigateToFloorDetails(floor.id),
      condition: () => true,
    },
    {
      icon: 'fas fa-trash-alt',
      label: 'actions.DELETE', // 🔑 translation key
      action: (floor) => this.deleteFloor(floor),
      condition: (_, role) => role === 'Admin',
    },
  ];

  // ==================== CONSTRUCTOR ====================
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private floorService: FloorService,
    private exportService: ExportService // Inject ExportService
  ) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.handleBuildingIdParam();
    this.loadPaginatedFloors();
  }

  // ==================== DATA LOADING ====================

  /**
   * Load floors with current filters & pagination
   */
  loadPaginatedFloors(): void {
    const filters = this.buildFilters();
    this.floorService.getFloorsPaged(filters).subscribe((data) => {
      this.updateFloorData(data);
    });
  }

  /**
   * Update component state with paginated data
   */
  private updateFloorData(data: FloorPaginationData): void {
    this.floors = data.data;
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    this.totalCount = data.totalCount;
    this.pageSize = data.pageSize;
  }

  // ==================== EVENT HANDLERS ====================

  onSearchChange(searchTerm: string): void {
    this.searchData = searchTerm;
    this.currentPage = 1;
    this.loadPaginatedFloors();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = { ...filterObj };
    this.currentPage = 1;
    this.loadPaginatedFloors();
    this.showFilterModal = false;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadPaginatedFloors();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadPaginatedFloors();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'floors',
      headers: ['Name', 'Building', 'Organization', 'City'],
      data: this.floors,
      columnKeys: ['name', 'buildingName', 'organizationName', 'cityName'],
      pdfTitle: 'Floors List',
    };

    this.exportService.exportToPDF(exportConfig);
  }

  downloadAsExcel(): void {
    const exportConfig: ExportConfig = {
      fileName: 'floors',
      sheetName: 'Floors',
      headers: ['Name', 'Building', 'Organization', 'City'],
      data: this.floors,
      columnKeys: ['name', 'buildingName', 'organizationName', 'cityName'],
    };

    this.exportService.exportToExcel(exportConfig);
  }

  printPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'floors',
      headers: ['Name', 'Building', 'Organization', 'City'],
      data: this.floors,
      columnKeys: ['name', 'buildingName', 'organizationName', 'cityName'],
      pdfTitle: 'Floors List',
    };

    this.exportService.printPDF(exportConfig);
  }

  // ==================== QUICK EXPORT METHODS ====================

  /** Quick export using simplified methods */
  quickDownloadPDF(): void {
    const tableData = this.floors.map((floor) => [
      floor.name,
      floor.buildingName,
      floor.organizationName,
      floor.cityName,
    ]);

    this.exportService.quickPDF(
      'floors',
      ['Name', 'Building', 'Organization', 'City'],
      tableData
    );
  }

  quickDownloadExcel(): void {
    const tableData = this.floors.map((floor) => [
      floor.name,
      floor.buildingName,
      floor.organizationName,
      floor.cityName,
    ]);

    this.exportService.quickExcel(
      'floors',
      ['Name', 'Building', 'Organization', 'City'],
      tableData
    );
  }

  // ==================== FLOOR ACTIONS ====================

  openEditModal(floor: Floor): void {
    this.router.navigate(['admin', 'edit-floor', floor.id]);
  }

  navigateToFloorDetails(id: number): void {
    this.router.navigate([`/${this.getBaseRouteByRole()}/floor-details/${id}`]);
  }

  navigateToAddFloor(): void {
    this.router.navigate(['/admin/add-floor']);
  }

  navigateToDeletedFloors(): void {
    this.router.navigate(['admin', 'deleted-floors']);
  }

  deleteFloor(floor: Floor): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete floor ${floor.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.floorService.softDeleteFloor(floor.id).subscribe(() => {
          this.showSuccess(`Deleted ${floor.name}.`);
          this.loadPaginatedFloors();
        });
      }
    });
  }

  // ==================== HELPER METHODS ====================

  private handleBuildingIdParam(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['buildingId']) {
        this.onFilterApplied({ selectedBuilding: params['buildingId'] });
        // Remove buildingId from URL
        this.router.navigate([], {
          queryParams: { buildingId: null },
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
      buildingId: f.selectedBuilding,
      organizationId: f.selectedOrganization,
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
}
