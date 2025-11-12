// ==================== ANGULAR CORE & COMMON MODULES ====================
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// ==================== THIRD-PARTY LIBRARIES ====================
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';

// ==================== SERVICES & MODELS ====================
import { SectionService } from '../../../services/work-location/section.service';
import {
  Section,
  SectionPaginationData,
} from '../../../models/work-location/section.model';

// ==================== CUSTOM COMPONENTS ====================
import {
  TableDataComponent,
  TableColumn,
  TableAction,
} from '../../../../../shared/components/table-data/table-data.component';
import { SectionFilterComponent } from '../../../../../shared/components/filters/work-location/section-filter/section-filter.component';
import { ReusableFilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';

// ==================== HELPERS ====================
import { getUserRole } from '../../../../../core/helpers/auth.helpers';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';
import { ExportConfig, ExportService } from '../../../../../shared/services/export.service';

/**
 * Section Management Component
 * - Handles listing sections, pagination, filtering, CRUD actions
 * - Supports PDF & Excel export
 * - Designed as standalone component for modularity
 */
@Component({
  selector: 'app-section-management',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableDataComponent,
    SectionFilterComponent,
    ReusableFilterBarComponent,
    PageTitleComponent,
  ],
  templateUrl: './section-management.component.html',
  styleUrls: ['./section-management.component.scss'],
})
export class SectionManagementComponent {
  // ==================== STATE & UI PROPERTIES ====================
  searchData: string = '';
  filterData: any = {};
  showFilterModal: boolean = false;

  // Pagination properties
  sections: Section[] = [];
  currentPage: number = 1;
  pageSize: number | undefined = 5;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'work-location.table.SECTION', type: 'text' },
    { key: 'floorName', label: 'work-location.table.FLOOR', type: 'text' },
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
  ];

  // Table actions with role-based conditions
  tableActions: TableAction[] = [
    {
      icon: 'fas fa-edit',
      label: 'actions.EDIT', // 🔑 translation key
      action: (section) => this.openEditModal(section),
      condition: (_, role) => role === 'Admin',
    },
    {
      icon: 'fas fa-eye',
      label: 'actions.VIEW_DETAILS', // 🔑 translation key
      action: (section) => this.navigateToSectionDetails(section.id),
      condition: () => true,
    },
    {
      icon: 'fas fa-trash-alt',
      label: 'actions.DELETE', // 🔑 translation key
      action: (section) => this.deleteSection(section),
      condition: (_, role) => role === 'Admin',
    },
  ];

  // ==================== CONSTRUCTOR ====================
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sectionService: SectionService,
    private exportService: ExportService // Inject ExportService
  ) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.handleFloorIdParam();
    this.loadPaginatedSections();
  }

  // ==================== DATA LOADING ====================

  /**
   * Load sections with current filters & pagination
   */
  loadPaginatedSections(): void {
    const filters = this.buildFilters();

    if (this.currentUserRole.toLowerCase() === 'auditor') {
      // Use auditor-specific API
      this.sectionService.getAuditorSectionsPaged(filters).subscribe((data) => {
        this.updateSectionData(data);
      });
    } else {
      // Use regular sections API
      this.sectionService.getSectionsPaged(filters).subscribe((data) => {
        this.updateSectionData(data);
      });
    }
  }

  /**
   * Update component state with paginated data
   */
  private updateSectionData(data: SectionPaginationData): void {
    this.sections = data.data;
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    this.totalCount = data.totalCount;
    this.pageSize = data.pageSize;
  }

  // ==================== EVENT HANDLERS ====================

  onSearchChange(searchTerm: string): void {
    this.searchData = searchTerm;
    this.currentPage = 1;
    this.loadPaginatedSections();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = { ...filterObj };
    this.currentPage = 1;
    this.loadPaginatedSections();
    this.showFilterModal = false;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadPaginatedSections();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadPaginatedSections();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'sections',
      headers: ['Name', 'Floor', 'Building', 'Organization'],
      data: this.sections,
      columnKeys: ['name', 'floorName', 'buildingName', 'organizationName'],
      pdfTitle: 'Sections List',
      pdfOrientation: 'landscape',
    };

    this.exportService.exportToPDF(exportConfig);
  }

  downloadAsExcel(): void {
    const exportConfig: ExportConfig = {
      fileName: 'sections',
      sheetName: 'Sections',
      headers: ['Name', 'Floor', 'Building', 'Organization'],
      data: this.sections,
      columnKeys: ['name', 'floorName', 'buildingName', 'organizationName'],
    };

    this.exportService.exportToExcel(exportConfig);
  }

  printPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'sections',
      headers: ['Name', 'Floor', 'Building', 'Organization'],
      data: this.sections,
      columnKeys: ['name', 'floorName', 'buildingName', 'organizationName'],
      pdfTitle: 'Sections List',
      pdfOrientation: 'landscape',
    };

    this.exportService.printPDF(exportConfig);
  }

  // ==================== QUICK EXPORT METHODS ====================

  /** Quick export using simplified methods */
  quickDownloadPDF(): void {
    const tableData = this.sections.map((section) => [
      section.name,
      section.floorName,
      section.buildingName,
      section.organizationName,
    ]);

    this.exportService.quickPDF(
      'sections',
      ['Name', 'Floor', 'Building', 'Organization'],
      tableData
    );
  }

  quickDownloadExcel(): void {
    const tableData = this.sections.map((section) => [
      section.name,
      section.floorName,
      section.buildingName,
      section.organizationName,
    ]);

    this.exportService.quickExcel(
      'sections',
      ['Name', 'Floor', 'Building', 'Organization'],
      tableData
    );
  }

  // ==================== SECTION ACTIONS ====================

  openEditModal(section: Section): void {
    this.router.navigate(['admin', 'edit-section', section.id]);
  }

  navigateToSectionDetails(id: number): void {
    const userRole = getUserRole().toLowerCase();
    this.router.navigate([`/${userRole}/section-details/${id}`]);
  }

  navigateToAddSection(): void {
    this.router.navigate(['/admin/add-section']);
  }

  navigateToDeletedSections(): void {
    this.router.navigate(['admin', 'deleted-sections']);
  }

  deleteSection(section: Section): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete section ${section.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.sectionService.softDeleteSection(section.id).subscribe(() => {
          this.showSuccess(`Deleted ${section.name}.`);
          this.loadPaginatedSections();
        });
      }
    });
  }

  // ==================== HELPER METHODS ====================

  private handleFloorIdParam(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['floorId']) {
        this.onFilterApplied({ selectedFloor: params['floorId'] });
        // Remove floorId from URL
        this.router.navigate([], {
          queryParams: { floorId: null },
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
      floorId: f.selectedFloor,
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
