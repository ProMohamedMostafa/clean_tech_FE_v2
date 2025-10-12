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
import { MaterialService } from '../../../../services/stock-service/material.service';

@Component({
  selector: 'app-deleted-materials',
  templateUrl: './deleted-materials.component.html',
  styleUrls: ['./deleted-materials.component.scss'],
  standalone: true,
  imports: [
    TableDataComponent,
    ReusableFilterBarComponent,
    TranslateModule,
    PageTitleComponent,
  ],
})
export class DeletedMaterialsComponent implements OnInit {
  // ==================== DATA ====================
  deletedMaterials: any[] = [];
  currentUserRole: string = 'Admin';

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'categoryName', label: 'Category', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'restore',
      icon: 'fas fa-trash-restore',
      action: (material: any) => this.confirmRestore(material),
    },
    {
      label: 'force_delete',
      icon: 'fas fa-trash-alt',
      action: (material: any) => this.confirmForceDelete(material),
    },
  ];

  // ==================== PAGINATION & SEARCH ====================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 5;
  searchQuery = '';

  constructor(
    private materialService: MaterialService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeletedMaterials();
  }

  // ==================== LOAD & FILTER ====================

  loadDeletedMaterials(): void {
    this.materialService.getDeletedMaterials().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.deletedMaterials = response.data || [];
          // If the response includes pagination data
          if (response.currentPage) {
            this.currentPage = response.currentPage;
            this.totalPages = response.totalPages;
            this.totalCount = response.totalCount;
            this.pageSize = response.pageSize;
          } else {
            // Manual pagination if service returns all data
            this.totalCount = this.deletedMaterials.length;
            this.totalPages = Math.ceil(this.totalCount / this.pageSize);

            // Apply search filter if needed
            if (this.searchQuery) {
              this.deletedMaterials = this.deletedMaterials.filter(
                (material) =>
                  material.name
                    ?.toLowerCase()
                    .includes(this.searchQuery.toLowerCase()) ||
                  material.code
                    ?.toLowerCase()
                    .includes(this.searchQuery.toLowerCase()) ||
                  material.categoryName
                    ?.toLowerCase()
                    .includes(this.searchQuery.toLowerCase()) ||
                  material.unitName
                    ?.toLowerCase()
                    .includes(this.searchQuery.toLowerCase())
              );
            }

            // Apply pagination manually
            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;
            this.deletedMaterials = this.deletedMaterials.slice(
              startIndex,
              endIndex
            );
          }
        } else {
          this.deletedMaterials = [];
        }
      },
      error: (err) => {
        console.error('Error loading deleted materials:', err);
        this.deletedMaterials = [];
        Swal.fire('Error!', 'Failed to load deleted materials', 'error');
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDeletedMaterials();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size || 5;
    this.currentPage = 1;
    this.loadDeletedMaterials();
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadDeletedMaterials();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Name',
          'Code',
          'Category',
          'Unit',
          'Is Active',
          'Created At',
          'Deleted At',
        ],
      ],
      body: this.deletedMaterials.map((m) => [
        m.name,
        m.code,
        m.categoryName,
        m.unitName,
        m.isActive ? 'Yes' : 'No',
        m.createdAt,
        m.deletedAt,
      ]),
    });
    doc.save('deleted_materials.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.deletedMaterials.map((m) => ({
        Name: m.name,
        Code: m.code,
        Category: m.categoryName,
        Unit: m.unitName,
        'Is Active': m.isActive ? 'Yes' : 'No',
        'Created At': m.createdAt,
        'Deleted At': m.deletedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deleted Materials');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'deleted_materials.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Name',
          'Code',
          'Category',
          'Unit',
          'Is Active',
          'Created At',
          'Deleted At',
        ],
      ],
      body: this.deletedMaterials.map((m) => [
        m.name,
        m.code,
        m.categoryName,
        m.unitName,
        m.isActive ? 'Yes' : 'No',
        m.createdAt,
        m.deletedAt,
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
  confirmRestore(material: any): void {
    Swal.fire({
      title: 'Restore Material',
      text: `Are you sure you want to restore "${material.name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.materialService.restoreMaterial(material.id).subscribe({
          next: (response) => {
            if (response) {
              Swal.fire(
                'Restored!',
                'The material has been restored.',
                'success'
              );
              this.loadDeletedMaterials();
            } else {
              Swal.fire(
                'Error!',
                'There was an error restoring the material.',
                'error'
              );
            }
          },
          error: (err) => {
            console.error('Error restoring material:', err);
            Swal.fire(
              'Error!',
              'There was an error restoring the material.',
              'error'
            );
          },
        });
      }
    });
  }

  confirmForceDelete(material: any): void {
    Swal.fire({
      title: 'Permanently Delete Material',
      text: `This will permanently delete "${material.name}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.materialService.forceDeleteMaterial(material.id).subscribe({
          next: (response) => {
            if (response) {
              Swal.fire(
                'Deleted!',
                'The material has been permanently deleted.',
                'success'
              );
              this.loadDeletedMaterials();
            } else {
              Swal.fire(
                'Error!',
                'There was an error deleting the material.',
                'error'
              );
            }
          },
          error: (err) => {
            console.error('Error force deleting material:', err);
            Swal.fire(
              'Error!',
              'There was an error deleting the material.',
              'error'
            );
          },
        });
      }
    });
  }
}
