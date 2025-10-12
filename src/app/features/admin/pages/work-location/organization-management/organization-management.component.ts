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
import { OrganizationService } from '../../../services/work-location/organization.service';
import {
  Organization,
  OrganizationPaginationData,
} from '../../../models/work-location/organization.model';

// ==================== CUSTOM COMPONENTS ====================
import {
  TableDataComponent,
  TableColumn,
  TableAction,
} from '../../../../../shared/components/table-data/table-data.component';
import { OrganizationFilterComponent } from '../../../../../shared/components/filters/work-location/organization-filter/organization-filter.component';
import { ReusableFilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';

// ==================== HELPERS ====================
import { getUserRole } from '../../../../../core/helpers/auth.helpers';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';

/**
 * Organization Management Component
 * - Handles listing organizations, pagination, filtering, CRUD actions
 * - Supports PDF & Excel export
 * - Designed as standalone component for modularity
 */
@Component({
  selector: 'app-organization-management',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableDataComponent,
    OrganizationFilterComponent,
    ReusableFilterBarComponent,
    PageTitleComponent,
  ],
  templateUrl: './organization-management.component.html',
  styleUrls: ['./organization-management.component.scss'],
})
export class OrganizationManagementComponent {
  // ==================== STATE & UI PROPERTIES ====================
  searchData: string = '';
  filterData: any = {};
  showFilterModal: boolean = false;

  // Pagination properties
  organizations: Organization[] = [];
  currentPage: number = 1;
  pageSize: number | undefined = 5;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'work-location.table.ORGANIZATION', type: 'text' },
    { key: 'cityName', label: 'work-location.table.CITY', type: 'text' },
    { key: 'areaName', label: 'work-location.table.AREA', type: 'text' },
    { key: 'countryName', label: 'work-location.table.COUNTRY', type: 'text' },
  ];

  // Table actions with role-based conditions
  tableActions: TableAction[] = [
    {
      icon: 'fas fa-edit',
      label: 'actions.EDIT', // 🔑 translation key
      action: (org) => this.openEditModal(org),
      condition: (_, role) => role === 'Admin',
    },
    {
      icon: 'fas fa-eye',
      label: 'actions.VIEW_DETAILS', // 🔑 translation key
      action: (org) => this.navigateToOrganizationDetails(org.id),
      condition: () => true,
    },
    {
      icon: 'fas fa-trash-alt',
      label: 'actions.DELETE', // 🔑 translation key
      action: (org) => this.deleteOrganization(org),
      condition: (_, role) => role === 'Admin',
    },
  ];

  // ==================== CONSTRUCTOR ====================
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationService: OrganizationService
  ) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.handleCityIdParam();
    this.loadPaginatedOrganizations();
  }

  // ==================== DATA LOADING ====================

  /**
   * Load organizations with current filters & pagination
   */
  loadPaginatedOrganizations(): void {
    const filters = this.buildFilters();
    this.organizationService
      .getOrganizationsPaged(filters)
      .subscribe((data) => {
        this.updateOrganizationData(data);
      });
  }

  /**
   * Update component state with paginated data
   */
  private updateOrganizationData(data: OrganizationPaginationData): void {
    this.organizations = data.data;
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    this.totalCount = data.totalCount;
    this.pageSize = data.pageSize;
  }

  // ==================== EVENT HANDLERS ====================

  onSearchChange(searchTerm: string): void {
    this.searchData = searchTerm;
    this.currentPage = 1;
    this.loadPaginatedOrganizations();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = { ...filterObj };
    this.currentPage = 1;
    this.loadPaginatedOrganizations();
    this.showFilterModal = false;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadPaginatedOrganizations();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadPaginatedOrganizations();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'City', 'Area', 'Country', 'Created At', 'Updated At']],
      body: this.organizations.map((o) => [
        o.name,
        o.cityName,
        o.areaName,
        o.countryName,
      ]),
    });
    doc.save('organizations.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.organizations.map((o) => ({
        Name: o.name,
        City: o.cityName,
        Area: o.areaName,
        Country: o.countryName,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Organizations');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'organizations.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'City', 'Area', 'Country', 'Created At', 'Updated At']],
      body: this.organizations.map((o) => [
        o.name,
        o.cityName,
        o.areaName,
        o.countryName,
      ]),
    });
    const pdfWindow = window.open(doc.output('bloburl'), '_blank');
    pdfWindow?.focus();
    pdfWindow?.print();
  }

  // ==================== ORGANIZATION ACTIONS ====================

  openEditModal(org: Organization): void {
    this.router.navigate(['admin', 'edit-organization', org.id]);
  }

  navigateToOrganizationDetails(id: number): void {
    this.router.navigate([
      `/${this.getBaseRouteByRole()}/organization-details/${id}`,
    ]);
  }

  navigateToAddOrganization(): void {
    this.router.navigate(['/admin/add-organization']);
  }

  navigateToDeletedOrganizations(): void {
    this.router.navigate(['admin', 'deleted-organizations']);
  }

  deleteOrganization(org: Organization): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete organization ${org.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.organizationService
          .softDeleteOrganization(org.id)
          .subscribe(() => {
            this.showSuccess(`Deleted ${org.name}.`);
            this.loadPaginatedOrganizations();
          });
      }
    });
  }

  // ==================== HELPER METHODS ====================

  private handleCityIdParam(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['cityId']) {
        this.onFilterApplied({ selectedCity: params['cityId'] });
        // Remove cityId from URL
        this.router.navigate([], {
          queryParams: { cityId: null },
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
      city: f.selectedCity,
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
