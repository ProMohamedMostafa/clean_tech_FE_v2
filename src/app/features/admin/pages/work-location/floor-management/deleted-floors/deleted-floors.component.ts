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
import { FloorService } from '../../../../services/work-location/floor.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-deleted-floors',
  templateUrl: './deleted-floors.component.html',
  styleUrls: ['./deleted-floors.component.scss'],
  standalone: true,
  imports: [
    TableDataComponent,
    ReusableFilterBarComponent,
    TranslateModule,
    PageTitleComponent,
  ],
})
export class DeletedFloorsComponent implements OnInit {
  // ==================== DATA ====================
  deletedFloors: any[] = [];
  currentUserRole: string = 'Admin';

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'buildingName', label: 'Building', type: 'text' },
    { key: 'organizationName', label: 'Organization', type: 'text' },
    { key: 'cityName', label: 'City', type: 'text' },
    { key: 'areaName', label: 'Area', type: 'text' },
    { key: 'countryName', label: 'Country', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'restore',
      icon: 'fas fa-trash-restore',
      action: (floor: any) => this.confirmRestore(floor),
    },
    {
      label: 'force_delete',
      icon: 'fas fa-trash-alt',
      action: (floor: any) => this.confirmForceDelete(floor),
    },
  ];

  // ==================== PAGINATION & SEARCH ====================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize: number | undefined = 5;
  searchQuery = '';

  constructor(
    private floorService: FloorService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeletedFloors();
  }

  // ==================== LOAD & FILTER ====================

  loadDeletedFloors(): void {
    this.floorService.getDeletedFloors().subscribe({
      next: (floors: any[]) => {
        this.deletedFloors = floors || [];
        // For paginated version:
        // this.floorService.getFloorsPaged({
        //   PageNumber: this.currentPage,
        //   PageSize: this.pageSize,
        //   SearchQuery: this.searchQuery,
        //   IncludeDeleted: true
        // }).subscribe({
        //   next: (response) => {
        //     this.deletedFloors = response.data || [];
        //     this.currentPage = response.currentPage;
        //     this.totalPages = response.totalPages;
        //     this.totalCount = response.totalCount;
        //     this.pageSize = response.pageSize;
        //   },
        //   error: (err) => console.error('Error loading deleted floors:', err)
        // });
      },
      error: (err) => console.error('Error loading deleted floors:', err),
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDeletedFloors();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadDeletedFloors();
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadDeletedFloors();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Name',
          'Building',
          'Organization',
          'City',
          'Area',
          'Country',
          'Deleted At',
        ],
      ],
      body: this.deletedFloors.map((f) => [
        f.name,
        f.buildingName,
        f.organizationName,
        f.cityName,
        f.areaName,
        f.country,
        f.deletedAt,
      ]),
    });
    doc.save('deleted_floors.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.deletedFloors.map((f) => ({
        Name: f.name,
        Building: f.buildingName,
        Organization: f.organizationName,
        City: f.cityName,
        Area: f.areaName,
        Country: f.country,
        'Deleted At': f.deletedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deleted Floors');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'deleted_floors.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Name',
          'Building',
          'Organization',
          'City',
          'Area',
          'Country',
          'Deleted At',
        ],
      ],
      body: this.deletedFloors.map((f) => [
        f.name,
        f.buildingName,
        f.organizationName,
        f.cityName,
        f.areaName,
        f.country,
        f.deletedAt,
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
  confirmRestore(floor: any): void {
    Swal.fire({
      title: 'Restore Floor',
      text: `Are you sure you want to restore ${floor.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.floorService.restoreFloor(floor.id).subscribe({
          next: () => {
            Swal.fire('Restored!', 'The floor has been restored.', 'success');
            this.loadDeletedFloors();
          },
          error: (err) => {
            console.error('Error restoring floor:', err);
            Swal.fire(
              'Error!',
              'There was an error restoring the floor.',
              'error'
            );
          },
        });
      }
    });
  }

  confirmForceDelete(floor: any): void {
    Swal.fire({
      title: 'Permanently Delete Floor',
      text: `This will permanently delete ${floor.name}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.floorService.forceDeleteFloor(floor.id).subscribe({
          next: () => {
            Swal.fire(
              'Deleted!',
              'The floor has been permanently deleted.',
              'success'
            );
            this.loadDeletedFloors();
          },
          error: (err) => {
            console.error('Error force deleting floor:', err);
            Swal.fire(
              'Error!',
              'There was an error deleting the floor.',
              'error'
            );
          },
        });
      }
    });
  }
}
