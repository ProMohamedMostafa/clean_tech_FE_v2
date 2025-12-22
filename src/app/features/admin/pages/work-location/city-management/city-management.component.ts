// ==================== ANGULAR CORE & COMMON MODULES ====================
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// ==================== THIRD-PARTY LIBRARIES ====================
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';

// ==================== SERVICES & MODELS ====================
import { CityService } from '../../../services/work-location/city.service';
import {
  City,
  CityPaginationData,
} from '../../../models/work-location/city.model';

// ==================== CUSTOM COMPONENTS ====================
import {
  TableDataComponent,
  TableColumn,
  TableAction,
} from '../../../../../shared/components/table-data/table-data.component';
import { CityFilterComponent } from '../../../../../shared/components/filters/work-location/city-filter/city-filter.component';
import { ReusableFilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';

// ==================== HELPERS ====================
import { getUserRole } from '../../../../../core/helpers/auth.helpers';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';
import {
  ExportConfig,
  ExportService,
} from '../../../../../shared/services/export.service';

/**
 * City Management Component
 * - Handles listing cities, pagination, filtering, CRUD actions
 * - Supports PDF & Excel export
 * - Designed as standalone component for modularity
 */
@Component({
  selector: 'app-city-management',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableDataComponent,
    CityFilterComponent,
    ReusableFilterBarComponent,
    PageTitleComponent,
  ],
  templateUrl: './city-management.component.html',
  styleUrls: ['./city-management.component.scss'],
})
export class CityManagementComponent {
  // ==================== STATE & UI PROPERTIES ====================
  searchData: string = '';
  filterData: any = {};
  showFilterModal: boolean = false;

  // Pagination properties
  cities: City[] = [];
  currentPage: number = 1;
  pageSize: number | undefined = 5;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'work-location.table.CITY', type: 'text' },
    { key: 'areaName', label: 'work-location.table.AREA', type: 'text' },
    { key: 'countryName', label: 'work-location.table.COUNTRY', type: 'text' },
  ];

  // Table actions with role-based conditions
  tableActions: TableAction[] = [
    {
      icon: 'fas fa-edit',
      label: 'actions.EDIT', // 🔑 translation key
      action: (city) => this.openEditModal(city),
      condition: (_, role) => role === 'Admin',
    },
    {
      icon: 'fas fa-eye',
      label: 'actions.VIEW_DETAILS', // 🔑 translation key
      action: (city) => this.navigateToCityDetails(city.id),
      condition: () => true,
    },
    {
      icon: 'fas fa-trash-alt',
      label: 'actions.DELETE', // 🔑 translation key
      action: (city) => this.deleteCity(city),
      condition: (_, role) => role === 'Admin',
    },
  ];

  // ==================== CONSTRUCTOR ====================
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cityService: CityService,
    private exportService: ExportService // Inject ExportService
  ) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.loadPaginatedCities();
  }

  // ==================== DATA LOADING ====================

  /**
   * Load cities with current filters & pagination
   */
  loadPaginatedCities(): void {
    const filters = this.buildFilters();
    this.cityService.getCitiesPaged(filters).subscribe((response) => {
      this.updateCityData(response);
    });
  }

  /**
   * Update component state with paginated data
   */
  private updateCityData(data: CityPaginationData): void {
    this.cities = data.data;
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    this.totalCount = data.totalCount;
    this.pageSize = data.pageSize;
  }

  // ==================== EVENT HANDLERS ====================

  onSearchChange(searchTerm: string): void {
    this.searchData = searchTerm;
    this.currentPage = 1;
    this.loadPaginatedCities();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = { ...filterObj };
    this.currentPage = 1;
    this.loadPaginatedCities();
    this.showFilterModal = false;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadPaginatedCities();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadPaginatedCities();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'cities',
      headers: ['Name', 'Area', 'Country'],
      data: this.cities,
      columnKeys: ['name', 'areaName', 'countryName'],
      pdfTitle: 'Cities List',
    };

    this.exportService.exportToPDF(exportConfig);
  }

  downloadAsExcel(): void {
    const exportConfig: ExportConfig = {
      fileName: 'cities',
      sheetName: 'Cities',
      headers: ['Name', 'Area', 'Country'],
      data: this.cities,
      columnKeys: ['name', 'areaName', 'countryName'],
    };

    this.exportService.exportToExcel(exportConfig);
  }

  printPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'cities',
      headers: ['Name', 'Area', 'Country'],
      data: this.cities,
      columnKeys: ['name', 'areaName', 'countryName'],
      pdfTitle: 'Cities List',
    };

    this.exportService.printPDF(exportConfig);
  }

  // ==================== QUICK EXPORT METHODS ====================

  /** Quick export using simplified methods */
  quickDownloadPDF(): void {
    const tableData = this.cities.map((city) => [
      city.name,
      city.areaName,
      city.countryName,
    ]);

    this.exportService.quickPDF(
      'cities',
      ['Name', 'Area', 'Country'],
      tableData
    );
  }

  quickDownloadExcel(): void {
    const tableData = this.cities.map((city) => [
      city.name,
      city.areaName,
      city.countryName,
    ]);

    this.exportService.quickExcel(
      'cities',
      ['Name', 'Area', 'Country'],
      tableData
    );
  }

  // ==================== CITY ACTIONS ====================

  openEditModal(city: City): void {
    this.router.navigate(['admin', 'edit-city', city.id]);
  }

  navigateToCityDetails(id: number): void {
    this.router.navigate([`/${this.getBaseRouteByRole()}/city-details/${id}`]);
  }

  navigateToAddCity(): void {
    this.router.navigate(['/admin/add-city']);
  }

  navigateToDeletedCities(): void {
    this.router.navigate(['admin', 'deleted-cities']);
  }

  deleteCity(city: City): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete city ${city.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cityService.softDeleteCity(city.id).subscribe(() => {
          this.showSuccess(`Deleted ${city.name}.`);
          this.loadPaginatedCities();
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
      area: f.selectedArea,
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
