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
import { AreaService } from '../../../../services/work-location/area.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-deleted-areas',
  templateUrl: './deleted-areas.component.html',
  styleUrls: ['./deleted-areas.component.scss'],
  standalone: true,
  imports: [
    TableDataComponent,
    ReusableFilterBarComponent,
    TranslateModule,
    PageTitleComponent,
  ],
})
export class DeletedAreasComponent implements OnInit {
  // ==================== DATA ====================
  deletedAreas: any[] = [];
  currentUserRole: string = 'Admin'; // Replace with dynamic value if needed

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'countryName', label: 'Country', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'restore',
      icon: 'fas fa-trash-restore',
      action: (area: any) => this.confirmRestore(area),
    },
    {
      label: 'force_delete',
      icon: 'fas fa-trash-alt',
      action: (area: any) => this.confirmForceDelete(area),
    },
  ];

  // ==================== PAGINATION & SEARCH ====================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize: number | undefined = 5;
  searchQuery = '';

  constructor(
    private areaService: AreaService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeletedAreas();
  }

  // ==================== LOAD & FILTER ====================

  /** Fetch deleted areas list from API */
  loadDeletedAreas(): void {
    this.areaService.getDeletedAreas().subscribe({
      next: (areas: any[]) => {
        this.deletedAreas = areas || [];
        // If your API supports pagination for deleted items, use this instead:
        // this.areaService.getPaginatedAreas({
        //   PageNumber: this.currentPage,
        //   PageSize: this.pageSize,
        //   SearchQuery: this.searchQuery,
        //   IncludeDeleted: true
        // }).subscribe({
        //   next: (response: any) => {
        //     this.deletedAreas = response.data || [];
        //     this.currentPage = response.currentPage;
        //     this.totalPages = response.totalPages;
        //     this.totalCount = response.totalCount;
        //     this.pageSize = response.pageSize;
        //   },
        //   error: (err) => console.error('Error loading deleted areas:', err),
        // });
      },
      error: (err) => console.error('Error loading deleted areas:', err),
    });
  }

  /** Handle page change event */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDeletedAreas();
  }

  /** Handle page size change */
  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadDeletedAreas();
  }

  /** Handle search change */
  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadDeletedAreas();
  }

  // ==================== EXPORT & PRINT ====================

  /** Export deleted areas list as PDF */
  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Country', 'Deleted At']],
      body: this.deletedAreas.map((a) => [a.name, a.country, a.deletedAt]),
    });
    doc.save('deleted_areas.pdf');
  }

  /** Export deleted areas list as Excel */
  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.deletedAreas.map((a) => ({
        Name: a.name,
        Country: a.country,
        'Deleted At': a.deletedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deleted Areas');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'deleted_areas.xlsx');
  }

  /** Print deleted areas list as PDF */
  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Country', 'Deleted At']],
      body: this.deletedAreas.map((a) => [a.name, a.country, a.deletedAt]),
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
  confirmRestore(area: any): void {
    Swal.fire({
      title: 'Restore Area',
      text: `Are you sure you want to restore ${area.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.areaService.restoreArea(area.id).subscribe({
          next: (success) => {
            if (success) {
              Swal.fire('Restored!', 'The area has been restored.', 'success');
              this.loadDeletedAreas();
            } else {
              Swal.fire(
                'Error!',
                'There was an error restoring the area.',
                'error'
              );
            }
          },
          error: (err) => {
            console.error('Error restoring area:', err);
            Swal.fire(
              'Error!',
              'There was an error restoring the area.',
              'error'
            );
          },
        });
      }
    });
  }

  confirmForceDelete(area: any): void {
    Swal.fire({
      title: 'Permanently Delete Area',
      text: `This will permanently delete ${area.name}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.areaService.forceDeleteArea(area.id).subscribe({
          next: (success) => {
            if (success) {
              Swal.fire(
                'Deleted!',
                'The area has been permanently deleted.',
                'success'
              );
              this.loadDeletedAreas();
            } else {
              Swal.fire(
                'Error!',
                'There was an error deleting the area.',
                'error'
              );
            }
          },
          error: (err) => {
            console.error('Error force deleting area:', err);
            Swal.fire(
              'Error!',
              'There was an error deleting the area.',
              'error'
            );
          },
        });
      }
    });
  }
}
