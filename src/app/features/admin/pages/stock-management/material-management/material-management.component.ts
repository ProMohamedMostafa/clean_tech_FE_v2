import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';
import { MaterialFilterComponent } from '../../../../../shared/components/filters/material-filter/material-filter.component';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ReusableFilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';
import { MaterialContainerComponent } from '../../../../../shared/components/material-container/material-container.component';
import { MaterialService } from '../../../services/stock-service/material.service';
import { getUserRole } from '../../../../../core/helpers/auth.helpers';
import { MaterialOffcanvasComponent } from './material-offcanvas/material-offcanvas.component';
import Offcanvas from 'bootstrap/js/dist/offcanvas';
import { CategoryService } from '../../../services/stock-service/category.service';
import { ProviderService } from '../../../services/provider.service';
import { DecreaseQualityComponent } from './decrease-quality/decrease-quality.component';
import { IncreaseQualityComponent } from './increase-quality/increase-quality.component';
import {
  ExportConfig,
  ExportService,
} from '../../../../../shared/services/export.service';

@Component({
  selector: 'app-material-management',
  templateUrl: './material-management.component.html',
  styleUrls: ['./material-management.component.scss'],
  standalone: true,
  imports: [
    ReusableFilterBarComponent,
    MaterialFilterComponent,
    TranslateModule,
    PageTitleComponent,
    MaterialContainerComponent,
    CommonModule,
    MaterialOffcanvasComponent,
    IncreaseQualityComponent,
    DecreaseQualityComponent,
  ],
})
export class MaterialManagementComponent implements OnInit {
  @ViewChild(MaterialOffcanvasComponent)
  materialOffcanvas!: MaterialOffcanvasComponent;

  // ==================== DATA ====================
  materials: any[] = [];
  currentUserRole: string = 'Admin';
  filterData: any = {};
  showFilterModal: boolean = false;
  selectedMaterial: any = null;
  categories: any[] = [];
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 8;
  searchQuery = '';
  showIncreaseModal = false;
  showDecreaseModal = false;
  currentProviders: any[] = [];
  currentOperationMaterial: any = null;

  // ==================== TABLE CONFIG ====================
  tableColumns = [
    { key: 'name', label: 'INVENTORY.NAME', type: 'text' },
    { key: 'description', label: 'INVENTORY.DESCRIPTION', type: 'text' },
    { key: 'quantity', label: 'INVENTORY.QUANTITY', type: 'number' },
    { key: 'category', label: 'INVENTORY.CATEGORY', type: 'text' },
    { key: 'unit', label: 'INVENTORY.UNIT', type: 'text' },
  ];

  constructor(
    private materialService: MaterialService,
    private categoryService: CategoryService,
    private providerService: ProviderService,
    private router: Router,
    private exportService: ExportService // Inject ExportService
  ) {}

  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.loadMaterials();
    this.loadCategories();
    this.loadProviders();
  }

  // ==================== LOAD & FILTER ====================

  loadCategories(): void {
    this.categoryService.getCategories(1, 100).subscribe((response: any) => {
      this.categories = response.data.data || [];
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadMaterials();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size || 8;
    this.currentPage = 1;
    this.loadMaterials();
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadMaterials();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'materials',
      headers: ['Name', 'Description', 'Quantity', 'Category', 'Unit'],
      data: this.materials,
      columnKeys: ['name', 'description', 'quantity', 'category.name', 'unit'],
      columnFormatter: (material) => [
        material.name,
        material.description,
        material.quantity,
        material.category?.name || 'N/A',
        material.unit,
      ],
      pdfTitle: 'Materials Inventory Report',
      pdfOrientation: 'portrait',
    };

    this.exportService.exportToPDF(exportConfig);
  }

  downloadAsExcel(): void {
    const exportConfig: ExportConfig = {
      fileName: 'materials',
      sheetName: 'Materials',
      headers: ['Name', 'Description', 'Quantity', 'Category', 'Unit'],
      data: this.materials,
      columnKeys: ['name', 'description', 'quantity', 'category.name', 'unit'],
      columnFormatter: (material) => [
        material.name,
        material.description,
        material.quantity,
        material.category?.name || 'N/A',
        material.unit,
      ],
    };

    this.exportService.exportToExcel(exportConfig);
  }

  printPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'materials',
      headers: ['Name', 'Description', 'Quantity', 'Category', 'Unit'],
      data: this.materials,
      columnKeys: ['name', 'description', 'quantity', 'category.name', 'unit'],
      columnFormatter: (material) => [
        material.name,
        material.description,
        material.quantity,
        material.category?.name || 'N/A',
        material.unit,
      ],
      pdfTitle: 'Materials Inventory Report',
      pdfOrientation: 'portrait',
    };

    this.exportService.printPDF(exportConfig);
  }

  // ==================== QUICK EXPORT METHODS ====================

  /** Quick export using simplified methods */
  quickDownloadPDF(): void {
    const tableData = this.materials.map((material) => [
      material.name,
      material.description,
      material.quantity,
      material.category?.name || 'N/A',
      material.unit,
    ]);

    this.exportService.quickPDF(
      'materials',
      ['Name', 'Description', 'Quantity', 'Category', 'Unit'],
      tableData
    );
  }

  quickDownloadExcel(): void {
    const tableData = this.materials.map((material) => [
      material.name,
      material.description,
      material.quantity,
      material.category?.name || 'N/A',
      material.unit,
    ]);

    this.exportService.quickExcel(
      'materials',
      ['Name', 'Description', 'Quantity', 'Category', 'Unit'],
      tableData
    );
  }

  // ==================== PERMISSIONS ====================

  isAdmin(): boolean {
    return this.currentUserRole === 'Admin';
  }

  // ==================== MODAL ACTIONS ====================

  openFilterModal(): void {
    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  // ==================== MATERIAL ACTIONS ====================

  onViewMaterial(material: any): void {
    this.router.navigate(['admin', 'material-details', material.id]);
  }

  deleteMaterial(material: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete material "${material.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.materialService.deleteMaterial(material.id).subscribe(() => {
          this.showSuccess(`Deleted material "${material.name}".`);
          this.loadMaterials();
        });
      }
    });
  }

  openAddModal(): void {
    this.materialOffcanvas.resetForm();

    const offcanvasElement = document.getElementById('materialOffcanvas');
    if (offcanvasElement) {
      const offcanvas = new Offcanvas(offcanvasElement);
      offcanvas.show();
    }
  }

  editMaterial(material: any): void {
    this.selectedMaterial = {
      ...material,
      categoryId: material.categoryId,
    };

    const offcanvasElement = document.getElementById('materialOffcanvas');
    if (offcanvasElement) {
      const offcanvas = new Offcanvas(offcanvasElement);
      offcanvas.show();
    }
  }

  handleMaterialUpdated(): void {
    this.loadMaterials();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = {
      ...filterObj,
      Category: filterObj.category,
      MinQuantity: filterObj.minQuantity,
      MaxQuantity: filterObj.maxQuantity,
    };
    this.currentPage = 1;
    this.loadMaterials();
    this.closeFilterModal();
  }

  loadMaterials(): void {
    const filters: any = {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      SearchQuery: this.searchQuery,
      ...this.filterData,
    };

    this.materialService
      .getMaterials(
        filters.PageNumber,
        filters.PageSize,
        filters.SearchQuery,
        filters.Category
      )
      .subscribe((response: any) => {
        const responseData = response.data;
        this.materials = responseData.data || [];
        this.currentPage = responseData.currentPage;
        this.totalPages = responseData.totalPages;
        this.totalCount = responseData.totalCount;
        this.pageSize = responseData.pageSize;
      });
  }

  loadProviders(): void {
    this.providerService.getPaginatedProviders(1).subscribe((response) => {
      this.currentProviders = response.data;
    });
  }

  addQuantity(material: any): void {
    this.currentOperationMaterial = material;
    this.showIncreaseModal = true;
  }

  reduceQuantity(material: any): void {
    this.currentOperationMaterial = material;
    this.showDecreaseModal = true;
  }

  handleStockInSuccess(success: boolean): void {
    this.showIncreaseModal = false;
    this.currentOperationMaterial = null;
    if (success) {
      this.loadMaterials();
    }
  }

  handleStockOutSuccess(success: boolean): void {
    this.showDecreaseModal = false;
    this.currentOperationMaterial = null;
    if (success) {
      this.loadMaterials();
    }
  }

  onIncreaseModalClose(): void {
    this.showIncreaseModal = false;
    this.currentOperationMaterial = null;
  }

  onDecreaseModalClose(): void {
    this.showDecreaseModal = false;
    this.currentOperationMaterial = null;
  }

  // ==================== HELPER METHODS ====================

  private showSuccess(message: string): void {
    Swal.fire({ icon: 'success', title: 'Success', text: message });
  }

  isAdminOrManager(): boolean {
    return (
      this.currentUserRole === 'Admin' || this.currentUserRole === 'Manager'
    );
  }
}
