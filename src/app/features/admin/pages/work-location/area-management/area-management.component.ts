// ==================== ANGULAR CORE & COMMON MODULES ====================
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// ==================== THIRD-PARTY LIBRARIES ====================
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';

// ==================== SERVICES & MODELS ====================
import { AreaService } from '../../../services/work-location/area.service';
import {
  Area,
  AreaPaginationData,
} from '../../../models/work-location/area.model';

// ==================== CUSTOM COMPONENTS ====================
import {
  TableDataComponent,
  TableColumn,
  TableAction,
} from '../../../../../shared/components/table-data/table-data.component';
import { AreaFilterComponent } from '../../../../../shared/components/filters/work-location/area-filter/area-filter.component';
import { ReusableFilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';

// ==================== HELPERS ====================
import { getUserRole } from '../../../../../core/helpers/auth.helpers';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';
import {
  ExportConfig,
  ExportService,
} from '../../../../../shared/services/export.service';

/**
 * Area Management Component
 * - Handles listing areas, pagination, filtering, CRUD actions
 * - Supports PDF & Excel export
 * - Designed as standalone component for modularity
 */
@Component({
  selector: 'app-area-management',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableDataComponent,
    AreaFilterComponent,
    ReusableFilterBarComponent,
    PageTitleComponent,
  ],
  templateUrl: './area-management.component.html',
  styleUrls: ['./area-management.component.scss'],
})
export class AreaManagementComponent {
  // ==================== STATE & UI PROPERTIES ====================
  searchData: string = '';
  filterData: any = {};
  showFilterModal: boolean = false;

  // Pagination properties
  areas: Area[] = [];
  currentPage: number = 1;
  pageSize: number | undefined = 5;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'work-location.table.AREA', type: 'text' },
    { key: 'countryName', label: 'work-location.table.COUNTRY', type: 'text' },
  ];

  // Table actions with role-based conditions
  tableActions: TableAction[] = [
    {
      icon: 'fas fa-edit',
      label: 'actions.EDIT', // 🔑 translation key
      action: (area) => this.openEditModal(area),
      condition: (_, role) => role === 'Admin',
    },
    {
      icon: 'fas fa-eye',
      label: 'actions.VIEW_DETAILS', // 🔑 translation key
      action: (area) => this.navigateToAreaDetails(area.id),
      condition: () => true,
    },
    {
      icon: 'fas fa-trash-alt',
      label: 'actions.DELETE', // 🔑 translation key
      action: (area) => this.deleteArea(area),
      condition: (_, role) => role === 'Admin',
    },
  ];

  // ==================== CONSTRUCTOR ====================
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private areaService: AreaService,
    private exportService: ExportService // Inject ExportService
  ) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.loadPaginatedAreas();
  }

  // ==================== DATA LOADING ====================

  /**
   * Load areas with current filters & pagination
   */
  loadPaginatedAreas(): void {
    const filters = this.buildFilters();
    this.areaService.getPaginatedAreas(filters).subscribe((response) => {
      this.updateAreaData(response);
    });
  }

  /**
   * Update component state with paginated data
   */
  private updateAreaData(data: AreaPaginationData): void {
    this.areas = data.data;
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    this.totalCount = data.totalCount;
    this.pageSize = data.pageSize;
  }

  // ==================== EVENT HANDLERS ====================

  onSearchChange(searchTerm: string): void {
    this.searchData = searchTerm;
    this.currentPage = 1;
    this.loadPaginatedAreas();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = { ...filterObj };
    this.currentPage = 1;
    this.loadPaginatedAreas();
    this.showFilterModal = false;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadPaginatedAreas();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadPaginatedAreas();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'areas',
      headers: ['Name', 'Country'],
      data: this.areas,
      columnKeys: ['name', 'countryName'],
      pdfTitle: 'Areas List',
      pdfOrientation: 'portrait',
    };

    this.exportService.exportToPDF(exportConfig);
  }

  downloadAsExcel(): void {
    const exportConfig: ExportConfig = {
      fileName: 'areas',
      sheetName: 'Areas',
      headers: ['Name', 'Country'],
      data: this.areas,
      columnKeys: ['name', 'countryName'],
    };

    this.exportService.exportToExcel(exportConfig);
  }

  printPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'areas',
      headers: ['Name', 'Country'],
      data: this.areas,
      columnKeys: ['name', 'countryName'],
      pdfTitle: 'Areas List',
      pdfOrientation: 'portrait',
    };

    this.exportService.printPDF(exportConfig);
  }

  // ==================== QUICK EXPORT METHODS ====================

  /** Quick export using simplified methods */
  quickDownloadPDF(): void {
    const tableData = this.areas.map((area) => [area.name, area.countryName]);

    this.exportService.quickPDF('areas', ['Name', 'Country'], tableData);
  }

  quickDownloadExcel(): void {
    const tableData = this.areas.map((area) => [area.name, area.countryName]);

    this.exportService.quickExcel('areas', ['Name', 'Country'], tableData);
  }

  // ==================== AREA ACTIONS ====================

  openEditModal(area: Area): void {
    this.router.navigate(['admin', 'edit-area', area.id]);
  }

  navigateToAreaDetails(id: number): void {
    this.router.navigate([`/${this.getBaseRouteByRole()}/area-details/${id}`]);
  }

  navigateToAddArea(): void {
    this.router.navigate(['/admin/add-area']);
  }

  navigateToDeletedAreas(): void {
    this.router.navigate(['admin', 'deleted-areas']);
  }

  deleteArea(area: Area): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete area ${area.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.areaService.deleteArea(area.id).subscribe((success) => {
          this.showSuccess(`Deleted ${area.name}.`);
          this.loadPaginatedAreas();
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
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      SearchQuery: this.searchData || '',
      Country: f.selectedCountry,
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
