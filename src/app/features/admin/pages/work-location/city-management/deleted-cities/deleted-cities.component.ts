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
import { CityService } from '../../../../services/work-location/city.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-deleted-cities',
  templateUrl: './deleted-cities.component.html',
  styleUrls: ['./deleted-cities.component.scss'],
  standalone: true,
  imports: [
    TableDataComponent,
    ReusableFilterBarComponent,
    TranslateModule,
    PageTitleComponent,
  ],
})
export class DeletedCitiesComponent implements OnInit {
  // ==================== DATA ====================
  deletedCities: any[] = [];
  currentUserRole: string = 'Admin'; // Replace with dynamic value if needed

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'areaName', label: 'Area', type: 'text' },
    { key: 'countryName', label: 'Country', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'restore',
      icon: 'fas fa-trash-restore',
      action: (city: any) => this.confirmRestore(city),
    },
    {
      label: 'force_delete',
      icon: 'fas fa-trash-alt',
      action: (city: any) => this.confirmForceDelete(city),
    },
  ];

  // ==================== PAGINATION & SEARCH ====================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize: number | undefined = 5;
  searchQuery = '';

  constructor(
    private cityService: CityService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeletedCities();
  }

  // ==================== LOAD & FILTER ====================

  /** Fetch deleted cities list from API */
  loadDeletedCities(): void {
    this.cityService.getDeletedCities().subscribe({
      next: (cities: any[]) => {
        this.deletedCities = cities || [];
        // If your API supports pagination for deleted items, use this instead:
        // this.cityService.getCitiesPaged({
        //   PageNumber: this.currentPage,
        //   PageSize: this.pageSize,
        //   SearchQuery: this.searchQuery,
        //   IncludeDeleted: true
        // }).subscribe({
        //   next: (response: any) => {
        //     this.deletedCities = response.data || [];
        //     this.currentPage = response.currentPage;
        //     this.totalPages = response.totalPages;
        //     this.totalCount = response.totalCount;
        //     this.pageSize = response.pageSize;
        //   },
        //   error: (err) => console.error('Error loading deleted cities:', err),
        // });
      },
      error: (err) => console.error('Error loading deleted cities:', err),
    });
  }

  /** Handle page change event */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDeletedCities();
  }

  /** Handle page size change */
  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadDeletedCities();
  }

  /** Handle search change */
  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadDeletedCities();
  }

  // ==================== EXPORT & PRINT ====================

  /** Export deleted cities list as PDF */
  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Area', 'Country', 'Deleted At']],
      body: this.deletedCities.map((c) => [
        c.name,
        c.areaName,
        c.country,
        c.deletedAt,
      ]),
    });
    doc.save('deleted_cities.pdf');
  }

  /** Export deleted cities list as Excel */
  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.deletedCities.map((c) => ({
        Name: c.name,
        Area: c.areaName,
        Country: c.country,
        'Deleted At': c.deletedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deleted Cities');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'deleted_cities.xlsx');
  }

  /** Print deleted cities list as PDF */
  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Area', 'Country', 'Deleted At']],
      body: this.deletedCities.map((c) => [
        c.name,
        c.areaName,
        c.country,
        c.deletedAt,
      ]),
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
  confirmRestore(city: any): void {
    Swal.fire({
      title: 'Restore City',
      text: `Are you sure you want to restore ${city.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cityService.restoreCity(city.id).subscribe({
          next: () => {
            Swal.fire('Restored!', 'The city has been restored.', 'success');
            this.loadDeletedCities();
          },
          error: (err) => {
            console.error('Error restoring city:', err);
            Swal.fire(
              'Error!',
              'There was an error restoring the city.',
              'error'
            );
          },
        });
      }
    });
  }

  confirmForceDelete(city: any): void {
    Swal.fire({
      title: 'Permanently Delete City',
      text: `This will permanently delete ${city.name}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cityService.forceDeleteCity(city.id).subscribe({
          next: () => {
            Swal.fire(
              'Deleted!',
              'The city has been permanently deleted.',
              'success'
            );
            this.loadDeletedCities();
          },
          error: (err) => {
            console.error('Error force deleting city:', err);
            Swal.fire(
              'Error!',
              'There was an error deleting the city.',
              'error'
            );
          },
        });
      }
    });
  }
}
