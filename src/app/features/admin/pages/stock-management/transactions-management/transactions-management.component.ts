// ==================== ANGULAR CORE & COMMON MODULES ====================
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// ==================== THIRD-PARTY LIBRARIES ====================
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { TransactionsCardsComponent } from '../../../components/transactions-cards/transactions-cards.component';
import {
  TableAction,
  TableColumn,
  TableDataComponent,
} from '../../../../../shared/components/table-data/table-data.component';
import { TransactionsFilterComponent } from '../../../../../shared/components/filters/transactions-filter/transactions-filter.component';
import { ReusableFilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';
import { StockService } from '../../../services/stock-service/stock.service';
import { getUserRole } from '../../../../../core/helpers/auth.helpers';

/**
 * Transactions Management Component
 * - Handles listing transactions, pagination, filtering
 * - Supports PDF & Excel export
 * - Designed as standalone component for modularity
 */
@Component({
  selector: 'app-transactions-management',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TransactionsCardsComponent,
    TableDataComponent,
    TransactionsFilterComponent,
    ReusableFilterBarComponent,
    PageTitleComponent,
  ],
  templateUrl: './transactions-management.component.html',
  styleUrls: ['./transactions-management.component.scss'],
})
export class TransactionsManagementComponent implements OnInit {
  // ==================== STATE & UI PROPERTIES ====================
  searchData: string = '';
  filterData: any = {};
  showFilterModal: boolean = false;

  // Pagination properties
  transactions: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'TRANSACTIONS.MATERIAL', type: 'text' },
    { key: 'quantity', label: 'TRANSACTIONS.QUANTITY', type: 'text' },
    { key: 'provider', label: 'TRANSACTIONS.PROVIDER', type: 'text' },
    { key: 'userName', label: 'TRANSACTIONS.USER', type: 'text' },
    { key: 'type', label: 'TRANSACTIONS.TYPE', type: 'text' },
    { key: 'createdAt', label: 'TRANSACTIONS.DATE', type: 'date' },
    { key: 'file', label: 'TRANSACTIONS.INVOICE', type: 'image' },
    { key: 'category', label: 'TRANSACTIONS.CATEGORY', type: 'text' },
  ];

  // Table actions with role-based conditions
  tableActions: TableAction[] = [];

  // ==================== CONSTRUCTOR ====================
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stockService: StockService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.subscribeToQueryParams();
  }

  // ==================== QUERY PARAM HANDLING ====================
  private subscribeToQueryParams(): void {
    this.route.queryParams.subscribe((params) => {
      this.handleQueryParams(params);
    });
  }

  private handleQueryParams(params: any): void {
    const newFilterData: any = {};

    // Extract and process type parameter
    if (params['type'] !== undefined) {
      newFilterData.selectedType = +params['type']; // Convert to number
    }

    // Extract and process month/year parameters to create date range
    if (params['month'] && params['year']) {
      const month = +params['month'];
      const year = +params['year'];

      // Create start date (first day of the month)
      const startDate = new Date(year, month - 1, 1);
      // Create end date (last day of the month)
      const endDate = new Date(year, month, 0);

      newFilterData.startDate = this.formatDate(startDate);
      newFilterData.endDate = this.formatDate(endDate);
    }

    // Apply the filters from URL parameters
    if (Object.keys(newFilterData).length > 0) {
      this.filterData = { ...this.filterData, ...newFilterData };
      this.currentPage = 1;
      this.loadPaginatedTransactions();
    } else {
      // Load without URL filters if no parameters present
      this.loadPaginatedTransactions();
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  // ==================== DATA LOADING ====================
  loadPaginatedTransactions(): void {
    const filters = this.buildFilters();
    this.stockService
      .getStockTransactions(
        filters.PageNumber,
        filters.PageSize,
        filters.Search,
        filters.UserId,
        filters.StartDate,
        filters.EndDate,
        filters.ProviderId,
        filters.CategoryId,
        filters.Type
      )
      .subscribe((response) => {
        this.updateTransactionData(response.data);
      });
  }

  private updateTransactionData(data: any): void {
    this.transactions = data.data.map((t: any) => ({
      ...t,
      transactionType:
        t.type === 0
          ? this.translate.instant('TRANSACTIONS.IN')
          : this.translate.instant('TRANSACTIONS.OUT'),
      transactionDate: t.createdDate,
    }));
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    this.totalCount = data.totalCount;
    this.pageSize = data.pageSize;
  }

  // ==================== EVENT HANDLERS ====================
  onSearchChange(searchTerm: string): void {
    this.searchData = searchTerm;
    this.currentPage = 1;
    this.loadPaginatedTransactions();
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadPaginatedTransactions();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size || 10;
    this.currentPage = 1;
    this.loadPaginatedTransactions();
  }

  // ==================== EXPORT & PRINT ====================
  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          this.translate.instant('TRANSACTIONS.MATERIAL'),
          this.translate.instant('TRANSACTIONS.QUANTITY'),
          this.translate.instant('TRANSACTIONS.TYPE'),
          this.translate.instant('TRANSACTIONS.PROVIDER'),
          this.translate.instant('TRANSACTIONS.DATE'),
          this.translate.instant('TRANSACTIONS.USER'),
        ],
      ],
      body: this.transactions.map((t) => [
        t.materialName,
        t.quantity,
        t.transactionType,
        t.providerName,
        t.transactionDate,
        t.userName,
      ]),
    });
    doc.save('transactions.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.transactions.map((t) => ({
        [this.translate.instant('TRANSACTIONS.MATERIAL')]: t.materialName,
        [this.translate.instant('TRANSACTIONS.QUANTITY')]: t.quantity,
        [this.translate.instant('TRANSACTIONS.TYPE')]: t.transactionType,
        [this.translate.instant('TRANSACTIONS.PROVIDER')]: t.providerName,
        [this.translate.instant('TRANSACTIONS.DATE')]: t.transactionDate,
        [this.translate.instant('TRANSACTIONS.USER')]: t.userName,
        [this.translate.instant('TRANSACTIONS.CATEGORY')]: t.categoryName,
        Notes: t.notes,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'transactions.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          this.translate.instant('TRANSACTIONS.MATERIAL'),
          this.translate.instant('TRANSACTIONS.QUANTITY'),
          this.translate.instant('TRANSACTIONS.TYPE'),
          this.translate.instant('TRANSACTIONS.PROVIDER'),
          this.translate.instant('TRANSACTIONS.DATE'),
          this.translate.instant('TRANSACTIONS.USER'),
        ],
      ],
      body: this.transactions.map((t) => [
        t.materialName,
        t.quantity,
        t.transactionType,
        t.providerName,
        t.transactionDate,
        t.userName,
      ]),
    });
    const pdfWindow = window.open(doc.output('bloburl'), '_blank');
    pdfWindow?.focus();
    pdfWindow?.print();
  }

  // ==================== TRANSACTION ACTIONS ====================
  navigateToTransactionDetails(id: any): void {
    this.router.navigate([
      `/${this.getBaseRouteByRole()}/transaction-details/${id}`,
    ]);
  }

  viewInvoice(invoiceUrl: string): void {
    window.open(invoiceUrl, '_blank');
  }

  deleteTransaction(transaction: any): void {
    Swal.fire({
      title: this.translate.instant('COMMON.ARE_YOU_SURE'),
      text: this.translate.instant('COMMON.DELETE_TRANSACTION', {
        material: transaction.materialName,
      }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('COMMON.YES_DELETE'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.showSuccess(
          this.translate.instant('COMMON.TRANSACTION_DELETED', {
            material: transaction.materialName,
          })
        );
        this.loadPaginatedTransactions();
      }
    });
  }

  closeFilterModal() {
    this.showFilterModal = false;
    this.cdr.detectChanges();
    console.log('Filter modal closed, showFilterModal:', this.showFilterModal);
  }

  // ==================== HELPER METHODS ====================
  isAdmin(): boolean {
    return this.currentUserRole === 'Admin';
  }

  onFilterApplied(filterObj: any) {
    this.filterData = {
      ...filterObj,
      selectedCategory: filterObj.categoryId,
      selectedType: filterObj.type,
      selectedUser: filterObj.userId,
      selectedProvider: filterObj.providerId,
      startDate: filterObj.startDate,
      endDate: filterObj.endDate,
    };
    this.currentPage = 1;
    this.loadPaginatedTransactions();
    this.showFilterModal = false;
    this.cdr.detectChanges();
  }

  private buildFilters(): any {
    const f = this.filterData;
    return {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      Search: this.searchData || '',
      UserId: f.selectedUser,
      StartDate: f.startDate,
      EndDate: f.endDate,
      ProviderId: f.selectedProvider,
      CategoryId: f.selectedCategory,
      Type: f.selectedType !== undefined ? +f.selectedType : undefined,
    };
  }

  private showSuccess(message: string): void {
    Swal.fire({
      icon: 'success',
      title: this.translate.instant('COMMON.SUCCESS'),
      text: message,
    });
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
    console.log('Opening filter modal, showFilterModal:', this.showFilterModal);
    this.cdr.detectChanges();
    setTimeout(() => {
      this.cdr.markForCheck();
      console.log('markForCheck called for filter modal');
    }, 0);
  }
}
