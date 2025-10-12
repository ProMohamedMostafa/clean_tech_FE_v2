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
import { SectionService } from '../../../../services/work-location/section.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-deleted-sections',
  templateUrl: './deleted-sections.component.html',
  styleUrls: ['./deleted-sections.component.scss'],
  standalone: true,
  imports: [
    TableDataComponent,
    ReusableFilterBarComponent,
    TranslateModule,
    PageTitleComponent,
  ],
})
export class DeletedSectionsComponent implements OnInit {
  // ==================== DATA ====================
  deletedSections: any[] = [];
  currentUserRole: string = 'Admin';

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'floorName', label: 'Floor', type: 'text' },
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
      action: (section: any) => this.confirmRestore(section),
    },
    {
      label: 'force_delete',
      icon: 'fas fa-trash-alt',
      action: (section: any) => this.confirmForceDelete(section),
    },
  ];

  // ==================== PAGINATION & SEARCH ====================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize: number | undefined = 5;
  searchQuery = '';

  constructor(
    private sectionService: SectionService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeletedSections();
  }

  // ==================== LOAD & FILTER ====================

  loadDeletedSections(): void {
    this.sectionService.getDeletedSections().subscribe({
      next: (sections: any[]) => {
        this.deletedSections = sections || [];
        // For paginated version:
        // this.sectionService.getSectionsPaged({
        //   PageNumber: this.currentPage,
        //   PageSize: this.pageSize,
        //   SearchQuery: this.searchQuery,
        //   IncludeDeleted: true
        // }).subscribe({
        //   next: (response) => {
        //     this.deletedSections = response.data || [];
        //     this.currentPage = response.currentPage;
        //     this.totalPages = response.totalPages;
        //     this.totalCount = response.totalCount;
        //     this.pageSize = response.pageSize;
        //   },
        //   error: (err) => console.error('Error loading deleted sections:', err)
        // });
      },
      error: (err) => console.error('Error loading deleted sections:', err),
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDeletedSections();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadDeletedSections();
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadDeletedSections();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Name',
          'Floor',
          'Building',
          'Organization',
          'City',
          'Area',
          'Country',
          'Deleted At',
        ],
      ],
      body: this.deletedSections.map((s) => [
        s.name,
        s.floorName,
        s.buildingName,
        s.organizationName,
        s.cityName,
        s.areaName,
        s.country,
        s.deletedAt,
      ]),
    });
    doc.save('deleted_sections.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.deletedSections.map((s) => ({
        Name: s.name,
        Floor: s.floorName,
        Building: s.buildingName,
        Organization: s.organizationName,
        City: s.cityName,
        Area: s.areaName,
        Country: s.country,
        'Deleted At': s.deletedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deleted Sections');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'deleted_sections.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Name',
          'Floor',
          'Building',
          'Organization',
          'City',
          'Area',
          'Country',
          'Deleted At',
        ],
      ],
      body: this.deletedSections.map((s) => [
        s.name,
        s.floorName,
        s.buildingName,
        s.organizationName,
        s.cityName,
        s.areaName,
        s.country,
        s.deletedAt,
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
  confirmRestore(section: any): void {
    Swal.fire({
      title: 'Restore Section',
      text: `Are you sure you want to restore ${section.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.sectionService.restoreSection(section.id).subscribe({
          next: () => {
            Swal.fire('Restored!', 'The section has been restored.', 'success');
            this.loadDeletedSections();
          },
          error: (err) => {
            console.error('Error restoring section:', err);
            Swal.fire(
              'Error!',
              'There was an error restoring the section.',
              'error'
            );
          },
        });
      }
    });
  }

  confirmForceDelete(section: any): void {
    Swal.fire({
      title: 'Permanently Delete Section',
      text: `This will permanently delete ${section.name}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.sectionService.forceDeleteSection(section.id).subscribe({
          next: () => {
            Swal.fire(
              'Deleted!',
              'The section has been permanently deleted.',
              'success'
            );
            this.loadDeletedSections();
          },
          error: (err) => {
            console.error('Error force deleting section:', err);
            Swal.fire(
              'Error!',
              'There was an error deleting the section.',
              'error'
            );
          },
        });
      }
    });
  }
}
