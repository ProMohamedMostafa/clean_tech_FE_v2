// ==================== ANGULAR CORE & COMMON MODULES ====================
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// ==================== THIRD-PARTY LIBRARIES ====================
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';

// ==================== SERVICES & MODELS ====================
import { BuildingService } from '../../../services/work-location/building.service';
import {
  Building,
  BuildingPaginationData,
} from '../../../models/work-location/building.model';

// ==================== CUSTOM COMPONENTS ====================
import {
  TableDataComponent,
  TableColumn,
  TableAction,
} from '../../../../../shared/components/table-data/table-data.component';
import { BuildingFilterComponent } from '../../../../../shared/components/filters/work-location/building-filter/building-filter.component';
import { ReusableFilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';

// ==================== HELPERS ====================
import { getUserRole } from '../../../../../core/helpers/auth.helpers';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';
import {
  ExportConfig,
  ExportService,
} from '../../../../../shared/services/export.service';

/**
 * Building Management Component
 * - Handles listing buildings, pagination, filtering, CRUD actions
 * - Supports PDF & Excel export
 * - Designed as standalone component for modularity
 */
@Component({
  selector: 'app-building-management',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableDataComponent,
    BuildingFilterComponent,
    ReusableFilterBarComponent,
    PageTitleComponent,
  ],
  templateUrl: './building-management.component.html',
  styleUrls: ['./building-management.component.scss'],
})
export class BuildingManagementComponent {
  // ==================== STATE & UI PROPERTIES ====================
  searchData: string = '';
  filterData: any = {};
  showFilterModal: boolean = false;

  // Pagination properties
  buildings: Building[] = [];
  currentPage: number = 1;
  pageSize: number | undefined = 5;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'work-location.table.BUILDING', type: 'text' },
    {
      key: 'organizationName',
      label: 'work-location.table.ORGANIZATION',
      type: 'text',
    },
    { key: 'cityName', label: 'work-location.table.CITY', type: 'text' },
    { key: 'areaName', label: 'work-location.table.AREA', type: 'text' },
  ];

  // Table actions with role-based conditions
  tableActions: TableAction[] = [
    {
      icon: 'fas fa-edit',
      label: 'actions.EDIT', // 🔑 translation key
      action: (building) => this.openEditModal(building),
      condition: (_, role) => role === 'Admin',
    },
    {
      icon: 'fas fa-eye',
      label: 'actions.VIEW_DETAILS', // 🔑 translation key
      action: (building) => this.navigateToBuildingDetails(building.id),
      condition: () => true,
    },
    {
      icon: 'fas fa-trash-alt',
      label: 'actions.DELETE', // 🔑 translation key
      action: (building) => this.deleteBuilding(building),
      condition: (_, role) => role === 'Admin',
    },
  ];

  // ==================== CONSTRUCTOR ====================
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private buildingService: BuildingService,
    private exportService: ExportService // Inject ExportService
  ) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.handleOrganizationIdParam();
    this.loadPaginatedBuildings();
  }

  // ==================== DATA LOADING ====================

  /**
   * Load buildings with current filters & pagination
   */
  loadPaginatedBuildings(): void {
    const filters = this.buildFilters();
    this.buildingService.getBuildingsPaged(filters).subscribe((data) => {
      this.updateBuildingData(data);
    });
  }

  /**
   * Update component state with paginated data
   */
  private updateBuildingData(data: BuildingPaginationData): void {
    this.buildings = data.data;
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    this.totalCount = data.totalCount;
    this.pageSize = data.pageSize;
  }

  // ==================== EVENT HANDLERS ====================

  onSearchChange(searchTerm: string): void {
    this.searchData = searchTerm;
    this.currentPage = 1;
    this.loadPaginatedBuildings();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = { ...filterObj };
    this.currentPage = 1;
    this.loadPaginatedBuildings();
    this.showFilterModal = false;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadPaginatedBuildings();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadPaginatedBuildings();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'buildings',
      headers: ['Name', 'Organization', 'City', 'Area'],
      data: this.buildings,
      columnKeys: ['name', 'organizationName', 'cityName', 'areaName'],
      pdfTitle: 'Buildings List',
    };

    this.exportService.exportToPDF(exportConfig);
  }

  downloadAsExcel(): void {
    const exportConfig: ExportConfig = {
      fileName: 'buildings',
      sheetName: 'Buildings',
      headers: ['Name', 'Organization', 'City', 'Area'],
      data: this.buildings,
      columnKeys: ['name', 'organizationName', 'cityName', 'areaName'],
    };

    this.exportService.exportToExcel(exportConfig);
  }

  printPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'buildings',
      headers: ['Name', 'Organization', 'City', 'Area'],
      data: this.buildings,
      columnKeys: ['name', 'organizationName', 'cityName', 'areaName'],
      pdfTitle: 'Buildings List',
    };

    this.exportService.printPDF(exportConfig);
  }

  // ==================== QUICK EXPORT METHODS ====================

  /** Quick export using simplified methods */
  quickDownloadPDF(): void {
    const tableData = this.buildings.map((building) => [
      building.name,
      building.organizationName,
      building.cityName,
      building.areaName,
    ]);

    this.exportService.quickPDF(
      'buildings',
      ['Name', 'Organization', 'City', 'Area'],
      tableData
    );
  }

  quickDownloadExcel(): void {
    const tableData = this.buildings.map((building) => [
      building.name,
      building.organizationName,
      building.cityName,
      building.areaName,
    ]);

    this.exportService.quickExcel(
      'buildings',
      ['Name', 'Organization', 'City', 'Area'],
      tableData
    );
  }

  // ==================== BUILDING ACTIONS ====================

  openEditModal(building: Building): void {
    this.router.navigate(['admin', 'edit-building', building.id]);
  }

  navigateToBuildingDetails(id: number): void {
    this.router.navigate([
      `/${this.getBaseRouteByRole()}/building-details/${id}`,
    ]);
  }

  navigateToAddBuilding(): void {
    this.router.navigate(['/admin/add-building']);
  }

  navigateToDeletedBuildings(): void {
    this.router.navigate(['admin', 'deleted-buildings']);
  }

  deleteBuilding(building: Building): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete building ${building.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.buildingService.softDeleteBuilding(building.id).subscribe(() => {
          this.showSuccess(`Deleted ${building.name}.`);
          this.loadPaginatedBuildings();
        });
      }
    });
  }

  // ==================== HELPER METHODS ====================

  private handleOrganizationIdParam(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['organizationId']) {
        this.onFilterApplied({
          selectedOrganization: params['organizationId'],
        });
        // Remove organizationId from URL
        this.router.navigate([], {
          queryParams: { organizationId: null },
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
      organizationId: f.selectedOrganization,
      cityId: f.selectedCity,
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
