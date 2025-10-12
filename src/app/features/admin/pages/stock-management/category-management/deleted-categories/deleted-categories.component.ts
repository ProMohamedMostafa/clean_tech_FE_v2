import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Shared & Reusable Components
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
} from '../../../../../../shared/components/table-data/table-data.component';
import { ReusableFilterBarComponent } from '../../../../../../shared/components/filter-bar/filter-bar.component';
import { PageTitleComponent } from '../../../../../../shared/components/page-title/page-title.component';
import { AuthService } from '../../../../../auth/services/auth.service';
import Swal from 'sweetalert2';
import { CategoryService } from '../../../../services/stock-service/category.service';

@Component({
  selector: 'app-deleted-categories',
  templateUrl: './deleted-categories.component.html',
  styleUrls: ['./deleted-categories.component.scss'],
  standalone: true,
  imports: [
    TableDataComponent,
    ReusableFilterBarComponent,
    TranslateModule,
    PageTitleComponent,
  ],
})
export class DeletedCategoriesComponent implements OnInit {
  // ==================== DATA ====================
  deletedCategories: any[] = [];
  currentUserRole: string = 'Admin';

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [{ key: 'name', label: 'Name', type: 'text' }];

  tableActions: TableAction[] = [
    {
      label: 'restore',
      icon: 'fas fa-trash-restore',
      action: (category: any) => this.confirmRestore(category),
    },
    {
      label: 'force_delete',
      icon: 'fas fa-trash-alt',
      action: (category: any) => this.confirmForceDelete(category),
    },
  ];

  // ==================== PAGINATION & SEARCH ====================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 5;
  searchQuery = '';

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeletedCategories();
  }

  // ==================== LOAD & FILTER ====================

  loadDeletedCategories(): void {
    this.categoryService.getDeletedCategories().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.deletedCategories = response.data || [];
          // If the response includes pagination data
          if (response.currentPage) {
            this.currentPage = response.currentPage;
            this.totalPages = response.totalPages;
            this.totalCount = response.totalCount;
            this.pageSize = response.pageSize;
          } else {
            // Manual pagination if service returns all data
            this.totalCount = this.deletedCategories.length;
            this.totalPages = Math.ceil(this.totalCount / this.pageSize);

            // Apply search filter if needed
            if (this.searchQuery) {
              this.deletedCategories = this.deletedCategories.filter(
                (category) =>
                  category.name
                    ?.toLowerCase()
                    .includes(this.searchQuery.toLowerCase()) ||
                  category.description
                    ?.toLowerCase()
                    .includes(this.searchQuery.toLowerCase()) ||
                  category.parentCategoryName
                    ?.toLowerCase()
                    .includes(this.searchQuery.toLowerCase())
              );
            }

            // Apply pagination manually
            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;
            this.deletedCategories = this.deletedCategories.slice(
              startIndex,
              endIndex
            );
          }
        } else {
          this.deletedCategories = [];
        }
      },
      error: (err) => {
        console.error('Error loading deleted categories:', err);
        this.deletedCategories = [];
        Swal.fire('Error!', 'Failed to load deleted categories', 'error');
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDeletedCategories();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size || 5;
    this.currentPage = 1;
    this.loadDeletedCategories();
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadDeletedCategories();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Name',
          'Description',
          'Parent Category',
          'Unit',
          'Is Active',
          'Created At',
          'Deleted At',
        ],
      ],
      body: this.deletedCategories.map((c) => [
        c.name,
        c.description,
        c.parentCategoryName,
        c.unitName,
        c.isActive ? 'Yes' : 'No',
        c.createdAt,
        c.deletedAt,
      ]),
    });
    doc.save('deleted_categories.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.deletedCategories.map((c) => ({
        Name: c.name,
        Description: c.description,
        'Parent Category': c.parentCategoryName,
        Unit: c.unitName,
        'Is Active': c.isActive ? 'Yes' : 'No',
        'Created At': c.createdAt,
        'Deleted At': c.deletedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deleted Categories');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'deleted_categories.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Name',
          'Description',
          'Parent Category',
          'Unit',
          'Is Active',
          'Created At',
          'Deleted At',
        ],
      ],
      body: this.deletedCategories.map((c) => [
        c.name,
        c.description,
        c.parentCategoryName,
        c.unitName,
        c.isActive ? 'Yes' : 'No',
        c.createdAt,
        c.deletedAt,
      ]),
    });
    const pdfWindow = window.open(doc.output('bloburl'), '_blank');
    pdfWindow?.focus();
    pdfWindow?.print();
  }

  // ==================== PERMISSIONS ====================

  isAdmin(): boolean {
    return true;
  }

  // ==================== SWEETALERT ACTIONS ====================
  confirmRestore(category: any): void {
    Swal.fire({
      title: 'Restore Category',
      text: `Are you sure you want to restore "${category.name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoryService.restoreCategory(category.id).subscribe({
          next: (response) => {
            if (response) {
              Swal.fire(
                'Restored!',
                'The category has been restored.',
                'success'
              );
              this.loadDeletedCategories();
            } else {
              Swal.fire(
                'Error!',
                'There was an error restoring the category.',
                'error'
              );
            }
          },
          error: (err) => {
            console.error('Error restoring category:', err);
            Swal.fire(
              'Error!',
              'There was an error restoring the category.',
              'error'
            );
          },
        });
      }
    });
  }

  confirmForceDelete(category: any): void {
    Swal.fire({
      title: 'Permanently Delete Category',
      text: `This will permanently delete "${category.name}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoryService.forceDeleteCategory(category.id).subscribe({
          next: (response) => {
            if (response) {
              Swal.fire(
                'Deleted!',
                'The category has been permanently deleted.',
                'success'
              );
              this.loadDeletedCategories();
            } else {
              Swal.fire(
                'Error!',
                'There was an error deleting the category.',
                'error'
              );
            }
          },
          error: (err) => {
            console.error('Error force deleting category:', err);
            Swal.fire(
              'Error!',
              'There was an error deleting the category.',
              'error'
            );
          },
        });
      }
    });
  }
}
