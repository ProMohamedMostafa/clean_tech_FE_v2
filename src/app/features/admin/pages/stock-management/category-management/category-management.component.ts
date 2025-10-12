import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Third-party libraries
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
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
import { CategoryFilterComponent } from '../../../../../shared/components/filters/category-filter/category-filter.component';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';
import { CategoryService } from '../../../services/stock-service/category.service';
import { getUserRole } from '../../../../../core/helpers/auth.helpers';
import { CategoryOffcanvasComponent } from './category-offcanvas/category-offcanvas.component';

import Offcanvas from 'bootstrap/js/dist/offcanvas';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableDataComponent,
    ReusableFilterBarComponent,
    CategoryFilterComponent,
    PageTitleComponent,
    CategoryOffcanvasComponent,
  ],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.scss'],
})
export class CategoryManagementComponent {
  @ViewChild(CategoryOffcanvasComponent)
  categoryOffcanvas!: CategoryOffcanvasComponent;

  // Component State
  searchData: string = '';
  filterData: any = {};
  showFilterModal: boolean = false;
  selectedCategory: any = null;
  categories: any[] = [];
  parentCategories: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';

  // Unit options for dropdown
  unitOptions = [
    { id: 0, name: 'Ml' },
    { id: 1, name: 'L' },
    { id: 2, name: 'Kg' },
    { id: 3, name: 'G' },
    { id: 4, name: 'M' },
    { id: 5, name: 'Cm' },
    { id: 6, name: 'Pieces' },
  ];

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'CATEGORY.NAME', type: 'text' },
    { key: 'unit', label: 'CATEGORY.UNIT', type: 'text' },
  ];

  // Table actions
  tableActions: TableAction[] = [
    {
      label: 'actions.EDIT', // 🔑 translation key
      icon: 'fas fa-edit',
      action: this.editCategory.bind(this),
    },
    {
      label: 'actions.DELETE', // 🔑 translation key
      icon: 'fas fa-trash-alt',
      action: this.deleteCategory.bind(this),
    },
  ];

  constructor(
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.loadCategories();
  }

  // Data Loading Methods
  loadCategories(): void {
    const filters = this.buildFilters();
    this.categoryService
      .getCategories(
        filters.PageNumber,
        filters.PageSize,
        filters.Search,
        filters.ParentCategory,
        filters.Unit
      )
      .subscribe((response) => {
        this.updateCategoryData(response.data);
      });
  }

  private updateCategoryData(data: any): void {
    this.categories = data.data;
    this.parentCategories = data.data;
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    this.totalCount = data.totalCount;
    this.pageSize = data.pageSize;
  }

  // UI Interaction Methods
  openAddCategoryOffcanvas(): void {
    this.selectedCategory = null;
    this.categoryOffcanvas.resetForm();
  }

  // Event Handlers
  onSearchChange(searchTerm: string): void {
    this.searchData = searchTerm;
    this.currentPage = 1;
    this.loadCategories();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = { ...filterObj };
    this.currentPage = 1;
    this.loadCategories();
    this.showFilterModal = false;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadCategories();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size || 10;
    this.currentPage = 1;
    this.loadCategories();
  }

  // Export & Print Methods
  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Name',
          'Description',
          'Parent Category',
          'Unit',
          'Created At',
          'Updated At',
          'Status',
        ],
      ],
      body: this.categories.map((item) => [
        item.name,
        item.description || 'N/A',
        item.parentCategory?.name || 'N/A',
        item.unit?.name || 'N/A',
        item.createdAt,
        item.updatedAt || 'N/A',
        item.status,
      ]),
    });
    doc.save('categories.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.categories.map((item) => ({
        Name: item.name,
        Description: item.description || 'N/A',
        'Parent Category': item.parentCategory?.name || 'N/A',
        Unit: item.unit?.name || 'N/A',
        'Created At': item.createdAt,
        'Updated At': item.updatedAt || 'N/A',
        Status: item.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'categories.xlsx');
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
          'Created At',
          'Updated At',
          'Status',
        ],
      ],
      body: this.categories.map((item) => [
        item.name,
        item.description || 'N/A',
        item.parentCategory?.name || 'N/A',
        item.unit?.name || 'N/A',
        item.createdAt,
        item.updatedAt || 'N/A',
        item.status,
      ]),
    });
    const pdfWindow = window.open(doc.output('bloburl'), '_blank');
    pdfWindow?.focus();
    pdfWindow?.print();
  }

  // Helper Methods
  private buildFilters(): any {
    const f = this.filterData;
    return {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      Search: this.searchData || '',
      ParentCategory: f.selectedParentCategory,
      Unit: f.selectedUnit,
    };
  }

  private showSuccess(message: string): void {
    Swal.fire({ icon: 'success', title: 'Success', text: message });
  }

  openFilterModal(): void {
    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  // Category Actions
  viewCategoryDetails(item: any): void {
    this.router.navigate(
      [`/${this.getBaseRouteByRole()}/category-details/${item.id}`],
      {
        state: { categoryData: item },
      }
    );
  }

  deleteCategory(item: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${item.name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoryService.deleteCategory(item.id).subscribe((response) => {
          this.showSuccess('Category deleted successfully');
          this.loadCategories();
        });
      }
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

  // Update the openAddModal method
  openAddModal(): void {
    this.selectedCategory = null;
    this.categoryOffcanvas.resetForm();

    const offcanvasElement = document.getElementById('categoryOffcanvas');
    if (offcanvasElement) {
      const offcanvas = new Offcanvas(offcanvasElement);
      offcanvas.show();
    }
  }

  // Update the editCategory method
  editCategory(item: any): void {
    this.selectedCategory = item;
    const offcanvasElement = document.getElementById('categoryOffcanvas');
    if (offcanvasElement) {
      const offcanvas = new Offcanvas(offcanvasElement);
      offcanvas.show();
    }
  }

  // Add this method
  handleCategoryUpdated(): void {
    this.loadCategories();
    this.selectedCategory = null;
  }
}
