import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProviderService } from '../../services/provider.service';
import { AuthService } from '../../../auth/services/auth.service';

// Shared & Reusable Components
import {
  TableAction,
  TableColumn,
  TableDataComponent,
} from '../../../../shared/components/table-data/table-data.component';
import { ReusableFilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { ProviderModalComponent } from '../../components/provider-modal/provider-modal.component';

// Translate
import { TranslateModule } from '@ngx-translate/core';
import { PageTitleComponent } from '../../../../shared/components/page-title/page-title.component';
import {
  ExportConfig,
  ExportService,
} from '../../../../shared/services/export.service';

@Component({
  selector: 'app-provider-management',
  templateUrl: './provider-management.component.html',
  styleUrls: ['./provider-management.component.scss'],
  standalone: true,
  imports: [
    TableDataComponent,
    ReusableFilterBarComponent,
    ProviderModalComponent,
    TranslateModule,
    PageTitleComponent,
  ],
})
export class ProviderManagementComponent implements OnInit {
  onAnswersToggled($event: boolean) {
    throw new Error('Method not implemented.');
  }
  onToggleAnswers($event: boolean) {
    throw new Error('Method not implemented.');
  }
  onEditQuestion() {
    throw new Error('Method not implemented.');
  }
  onQuestionSelected($event: boolean) {
    throw new Error('Method not implemented.');
  }
  // ==================== DATA ====================
  providers: any[] = [];
  currentUserRole: string = 'Admin'; // Replace with dynamic value if needed

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'ShiftTABLE.NAME', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'actions.EDIT', // 🔑 translation key
      icon: 'fas fa-edit',
      action: this.editProvider.bind(this),
    },
    {
      label: 'actions.DELETE', // 🔑 translation key
      icon: 'fas fa-trash-alt',
      action: this.deleteProvider.bind(this),
    },
  ];

  // ==================== PAGINATION & SEARCH ====================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize: number | undefined = 5;
  searchQuery = '';

  // ==================== MODAL ====================
  showProviderModal = false;
  selectedProvider: any = null;
  modalActionType: 'add' | 'edit' | 'delete' = 'add';

  constructor(
    private providerService: ProviderService,
    private router: Router,
    private authService: AuthService,
    private exportService: ExportService // Inject ExportService
  ) {}

  ngOnInit(): void {
    this.loadProviders();
  }

  // ==================== LOAD & FILTER ====================

  /** Fetch providers list from API */
  loadProviders(): void {
    this.providerService
      .getPaginatedProviders(this.currentPage, this.pageSize, this.searchQuery)
      .subscribe((response: any) => {
        this.providers = response.data || [];
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalCount = response.totalCount;
        this.pageSize = response.pageSize;
      });
  }

  /** Handle page change event */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProviders();
  }

  /** Handle page size change */
  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadProviders();
  }

  /** Handle search change */
  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadProviders();
  }

  // ==================== FILTER MODAL ====================

  openFilterModal(): void {
    this.showProviderModal = true;
  }

  closeFilterModal(): void {
    this.showProviderModal = false;
  }

  onFilterApplied(filters: any): void {
    this.closeFilterModal();
    this.loadProviders();
  }

  // ==================== EXPORT & PRINT ====================

  /** Export providers list as PDF */
  downloadAsPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'providers',
      headers: ['Name'],
      data: this.providers,
      columnKeys: ['name'], // Map the 'name' property from provider objects
      pdfTitle: 'Providers List',
      pdfOrientation: 'portrait',
    };

    this.exportService.exportToPDF(exportConfig);
  }

  /** Export providers list as Excel */
  downloadAsExcel(): void {
    const exportConfig: ExportConfig = {
      fileName: 'providers',
      sheetName: 'Providers',
      headers: ['Name'],
      data: this.providers,
      columnKeys: ['name'], // Map the 'name' property from provider objects
    };

    this.exportService.exportToExcel(exportConfig);
  }

  /** Print providers list as PDF */
  printPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'providers',
      headers: ['Name'],
      data: this.providers,
      columnKeys: ['name'],
      pdfTitle: 'Providers List',
      pdfOrientation: 'portrait',
    };

    this.exportService.printPDF(exportConfig);
  }

  // ==================== QUICK EXPORT METHODS ====================

  /** Quick export using simplified methods */
  quickDownloadPDF(): void {
    this.exportService.quickPDF(
      'providers',
      ['Name'],
      this.providers.map((p) => [p.name])
    );
  }

  quickDownloadExcel(): void {
    this.exportService.quickExcel(
      'providers',
      ['Name'],
      this.providers.map((p) => [p.name])
    );
  }

  // ==================== PERMISSIONS ====================

  /** Check if user is admin */
  isAdmin(): boolean {
    return true; // Replace with dynamic check if needed
  }

  // ==================== MODAL ACTIONS ====================

  /** Open modal to add new provider */
  openAddModal(): void {
    this.selectedProvider = { name: '' };
    this.modalActionType = 'add';
    this.showProviderModal = true;
  }

  /** Open modal to edit provider */
  editProvider(provider: any): void {
    this.selectedProvider = { ...provider };
    this.modalActionType = 'edit';
    this.showProviderModal = true;
  }

  /** Open modal to confirm delete provider */
  deleteProvider(provider: any): void {
    this.selectedProvider = { ...provider };
    this.modalActionType = 'delete';
    this.showProviderModal = true;
  }

  /** Close modal */
  closeProviderModal(): void {
    this.showProviderModal = false;
    this.selectedProvider = null;
  }
}
