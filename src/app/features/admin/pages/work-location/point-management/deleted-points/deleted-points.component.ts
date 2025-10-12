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
import { PointService } from '../../../../services/work-location/point.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-deleted-points',
  templateUrl: './deleted-points.component.html',
  styleUrls: ['./deleted-points.component.scss'],
  standalone: true,
  imports: [
    TableDataComponent,
    ReusableFilterBarComponent,
    TranslateModule,
    PageTitleComponent,
  ],
})
export class DeletedPointsComponent implements OnInit {
  // ==================== DATA ====================
  deletedPoints: any[] = [];
  currentUserRole: string = 'Admin';

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'sectionName', label: 'Section', type: 'text' },
    { key: 'floorName', label: 'Floor', type: 'text' },
    { key: 'buildingName', label: 'Building', type: 'text' },
    { key: 'organizationName', label: 'Organization', type: 'text' },
    { key: 'cityName', label: 'City', type: 'text' },
    { key: 'countryName', label: 'Country', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'restore',
      icon: 'fas fa-trash-restore',
      action: (point: any) => this.confirmRestore(point),
    },
    {
      label: 'force_delete',
      icon: 'fas fa-trash-alt',
      action: (point: any) => this.confirmForceDelete(point),
    },
  ];

  // ==================== PAGINATION & SEARCH ====================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize: number | undefined = 5;
  searchQuery = '';

  constructor(
    private pointService: PointService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeletedPoints();
  }

  // ==================== LOAD & FILTER ====================

  loadDeletedPoints(): void {
    this.pointService.getDeletedPoints().subscribe({
      next: (points: any[]) => {
        this.deletedPoints = points || [];
        // For paginated version:
        // this.pointService.getPointsPaged({
        //   PageNumber: this.currentPage,
        //   PageSize: this.pageSize,
        //   SearchQuery: this.searchQuery,
        //   IncludeDeleted: true
        // }).subscribe({
        //   next: (response) => {
        //     this.deletedPoints = response.data || [];
        //     this.currentPage = response.currentPage;
        //     this.totalPages = response.totalPages;
        //     this.totalCount = response.totalCount;
        //     this.pageSize = response.pageSize;
        //   },
        //   error: (err) => console.error('Error loading deleted points:', err)
        // });
      },
      error: (err) => console.error('Error loading deleted points:', err),
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDeletedPoints();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadDeletedPoints();
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadDeletedPoints();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Name',
          'Section',
          'Floor',
          'Building',
          'Organization',
          'City',
          'Country',
          'Deleted At',
        ],
      ],
      body: this.deletedPoints.map((p) => [
        p.name,
        p.sectionName,
        p.floorName,
        p.buildingName,
        p.organizationName,
        p.cityName,
        p.country,
        p.deletedAt,
      ]),
    });
    doc.save('deleted_points.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.deletedPoints.map((p) => ({
        Name: p.name,
        Section: p.sectionName,
        Floor: p.floorName,
        Building: p.buildingName,
        Organization: p.organizationName,
        City: p.cityName,
        Country: p.country,
        'Deleted At': p.deletedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deleted Points');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'deleted_points.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Name',
          'Section',
          'Floor',
          'Building',
          'Organization',
          'City',
          'Country',
          'Deleted At',
        ],
      ],
      body: this.deletedPoints.map((p) => [
        p.name,
        p.sectionName,
        p.floorName,
        p.buildingName,
        p.organizationName,
        p.cityName,
        p.country,
        p.deletedAt,
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
  confirmRestore(point: any): void {
    Swal.fire({
      title: 'Restore Point',
      text: `Are you sure you want to restore ${point.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.pointService.restorePoint(point.id).subscribe({
          next: () => {
            Swal.fire('Restored!', 'The point has been restored.', 'success');
            this.loadDeletedPoints();
          },
          error: (err) => {
            console.error('Error restoring point:', err);
            Swal.fire(
              'Error!',
              'There was an error restoring the point.',
              'error'
            );
          },
        });
      }
    });
  }

  confirmForceDelete(point: any): void {
    Swal.fire({
      title: 'Permanently Delete Point',
      text: `This will permanently delete ${point.name}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.pointService.forceDeletePoint(point.id).subscribe({
          next: () => {
            Swal.fire(
              'Deleted!',
              'The point has been permanently deleted.',
              'success'
            );
            this.loadDeletedPoints();
          },
          error: (err) => {
            console.error('Error force deleting point:', err);
            Swal.fire(
              'Error!',
              'There was an error deleting the point.',
              'error'
            );
          },
        });
      }
    });
  }
}
