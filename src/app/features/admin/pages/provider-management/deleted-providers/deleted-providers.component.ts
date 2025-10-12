import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Shared & Reusable Components

// Translate
import { TranslateModule } from '@ngx-translate/core';

// Export & Print Libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import {
  TableAction,
  TableColumn,
  TableDataComponent,
} from '../../../../../shared/components/table-data/table-data.component';
import { ReusableFilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';
import { ProviderService } from '../../../services/provider.service';
import { AuthService } from '../../../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-deleted-providers',
  templateUrl: './deleted-providers.component.html',
  styleUrls: ['./deleted-providers.component.scss'],
  standalone: true,
  imports: [
    TableDataComponent,
    ReusableFilterBarComponent,
    TranslateModule,
    PageTitleComponent,
  ],
})
export class DeletedProvidersComponent implements OnInit {
  // ==================== DATA ====================
  deletedProviders: any[] = [];
  currentUserRole: string = 'Admin'; // Replace with dynamic value if needed

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text' },
    // Add more columns if needed
  ];

  tableActions: TableAction[] = [
    {
      label: 'restore',
      icon: 'fas fa-trash-restore',
      action: (provider: any) => this.confirmRestore(provider),
    },
    {
      label: 'force_delete',
      icon: 'fas fa-trash-alt',
      action: (provider: any) => this.confirmForceDelete(provider),
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
  modalActionType: 'restore' | 'force_delete' = 'restore';

  constructor(
    private providerService: ProviderService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeletedProviders();
  }

  // ==================== LOAD & FILTER ====================

  /** Fetch deleted providers list from API */
  loadDeletedProviders(): void {
    this.providerService.getDeletedProviders().subscribe({
      next: (response: any) => {
        this.deletedProviders = response.data || [];
        // If your API supports pagination for deleted items, use this instead:
        // this.providerService
        //   .getPaginatedProviders(this.currentPage, this.pageSize, this.searchQuery, true)
        //   .subscribe({
        //     next: (response: any) => {
        //       this.deletedProviders = response.data || [];
        //       this.currentPage = response.currentPage;
        //       this.totalPages = response.totalPages;
        //       this.totalCount = response.totalCount;
        //       this.pageSize = response.pageSize;
        //     },
        //     error: (err) => console.error('Error loading deleted providers:', err),
        //   });
      },
      error: (err) => console.error('Error loading deleted providers:', err),
    });
  }

  /** Handle page change event */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDeletedProviders();
  }

  /** Handle page size change */
  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadDeletedProviders();
  }

  /** Handle search change */
  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadDeletedProviders();
  }

  // ==================== EXPORT & PRINT ====================

  /** Export deleted providers list as PDF */
  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Deleted At']],
      body: this.deletedProviders.map((p) => [p.name, p.deletedAt]),
    });
    doc.save('deleted_providers.pdf');
  }

  /** Export deleted providers list as Excel */
  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.deletedProviders.map((p) => ({
        Name: p.name,
        'Deleted At': p.deletedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deleted Providers');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'deleted_providers.xlsx');
  }

  /** Print deleted providers list as PDF */
  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Deleted At']],
      body: this.deletedProviders.map((p) => [p.name, p.deletedAt]),
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

  // ==================== SWEETALERT ACTIONS ====================
  confirmRestore(provider: any): void {
    Swal.fire({
      title: 'Restore Provider',
      text: `Are you sure you want to restore ${provider.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.providerService.restoreProvider(provider.id).subscribe({
          next: () => {
            Swal.fire(
              'Restored!',
              'The provider has been restored.',
              'success'
            );
            this.loadDeletedProviders();
          },
          error: (err) => {
            console.error('Error restoring provider:', err);
            Swal.fire(
              'Error!',
              'There was an error restoring the provider.',
              'error'
            );
          },
        });
      }
    });
  }

  confirmForceDelete(provider: any): void {
    Swal.fire({
      title: 'Permanently Delete Provider',
      text: `This will permanently delete ${provider.name}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.providerService.forceDeleteProvider(provider.id).subscribe({
          next: () => {
            Swal.fire(
              'Deleted!',
              'The provider has been permanently deleted.',
              'success'
            );
            this.loadDeletedProviders();
          },
          error: (err) => {
            console.error('Error force deleting provider:', err);
            Swal.fire(
              'Error!',
              'There was an error deleting the provider.',
              'error'
            );
          },
        });
      }
    });
  }
}
