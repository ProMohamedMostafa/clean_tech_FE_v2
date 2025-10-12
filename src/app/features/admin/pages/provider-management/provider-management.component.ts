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

// Export & Print Libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { PageTitleComponent } from '../../../../shared/components/page-title/page-title.component';

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
    private authService: AuthService
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
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name']],
      body: this.providers.map((p) => [p.name]),
    });
    doc.save('providers.pdf');
  }

  /** Export providers list as Excel */
  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.providers.map((p) => ({ Name: p.name }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Providers');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'providers.xlsx');
  }

  /** Print providers list as PDF */
  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name']],
      body: this.providers.map((p) => [p.name]),
    });
    const pdfWindow = window.open(doc.output('bloburl'), '_blank');
    pdfWindow?.focus();
    pdfWindow?.print();
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
