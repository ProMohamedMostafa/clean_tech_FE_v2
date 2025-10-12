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
import { BuildingService } from '../../../../services/work-location/building.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-deleted-buildings',
  templateUrl: './deleted-buildings.component.html',
  styleUrls: ['./deleted-buildings.component.scss'],
  standalone: true,
  imports: [
    TableDataComponent,
    ReusableFilterBarComponent,
    TranslateModule,
    PageTitleComponent,
  ],
})
export class DeletedBuildingsComponent implements OnInit {
  // ==================== DATA ====================
  deletedBuildings: any[] = [];
  currentUserRole: string = 'Admin';

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'organizationName', label: 'Organization', type: 'text' },
    { key: 'cityName', label: 'City', type: 'text' },
    { key: 'areaName', label: 'Area', type: 'text' },
    { key: 'countryName', label: 'Country', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'restore',
      icon: 'fas fa-trash-restore',
      action: (building: any) => this.confirmRestore(building),
    },
    {
      label: 'force_delete',
      icon: 'fas fa-trash-alt',
      action: (building: any) => this.confirmForceDelete(building),
    },
  ];

  // ==================== PAGINATION & SEARCH ====================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize: number | undefined = 5;
  searchQuery = '';

  constructor(
    private buildingService: BuildingService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeletedBuildings();
  }

  // ==================== LOAD & FILTER ====================

  loadDeletedBuildings(): void {
    this.buildingService.getDeletedBuildings().subscribe({
      next: (buildings: any[]) => {
        this.deletedBuildings = buildings || [];
        // For paginated version:
        // this.buildingService.getBuildingsPaged({
        //   PageNumber: this.currentPage,
        //   PageSize: this.pageSize,
        //   SearchQuery: this.searchQuery,
        //   IncludeDeleted: true
        // }).subscribe({
        //   next: (response) => {
        //     this.deletedBuildings = response.data || [];
        //     this.currentPage = response.currentPage;
        //     this.totalPages = response.totalPages;
        //     this.totalCount = response.totalCount;
        //     this.pageSize = response.pageSize;
        //   },
        //   error: (err) => console.error('Error loading deleted buildings:', err)
        // });
      },
      error: (err) => console.error('Error loading deleted buildings:', err),
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDeletedBuildings();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadDeletedBuildings();
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadDeletedBuildings();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Organization', 'City', 'Area', 'Country', 'Deleted At']],
      body: this.deletedBuildings.map((b) => [
        b.name,
        b.organizationName,
        b.cityName,
        b.areaName,
        b.country,
        b.deletedAt,
      ]),
    });
    doc.save('deleted_buildings.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.deletedBuildings.map((b) => ({
        Name: b.name,
        Organization: b.organizationName,
        City: b.cityName,
        Area: b.areaName,
        Country: b.country,
        'Deleted At': b.deletedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deleted Buildings');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'deleted_buildings.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Organization', 'City', 'Area', 'Country', 'Deleted At']],
      body: this.deletedBuildings.map((b) => [
        b.name,
        b.organizationName,
        b.cityName,
        b.areaName,
        b.country,
        b.deletedAt,
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
  confirmRestore(building: any): void {
    Swal.fire({
      title: 'Restore Building',
      text: `Are you sure you want to restore ${building.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.buildingService.restoreBuilding(building.id).subscribe({
          next: () => {
            Swal.fire(
              'Restored!',
              'The building has been restored.',
              'success'
            );
            this.loadDeletedBuildings();
          },
          error: (err) => {
            console.error('Error restoring building:', err);
            Swal.fire(
              'Error!',
              'There was an error restoring the building.',
              'error'
            );
          },
        });
      }
    });
  }

  confirmForceDelete(building: any): void {
    Swal.fire({
      title: 'Permanently Delete Building',
      text: `This will permanently delete ${building.name}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.buildingService.forceDeleteBuilding(building.id).subscribe({
          next: () => {
            Swal.fire(
              'Deleted!',
              'The building has been permanently deleted.',
              'success'
            );
            this.loadDeletedBuildings();
          },
          error: (err) => {
            console.error('Error force deleting building:', err);
            Swal.fire(
              'Error!',
              'There was an error deleting the building.',
              'error'
            );
          },
        });
      }
    });
  }
}
