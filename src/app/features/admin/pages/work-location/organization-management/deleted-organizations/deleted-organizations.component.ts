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
import { OrganizationService } from '../../../../services/work-location/organization.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-deleted-organizations',
  templateUrl: './deleted-organizations.component.html',
  styleUrls: ['./deleted-organizations.component.scss'],
  standalone: true,
  imports: [
    TableDataComponent,
    ReusableFilterBarComponent,
    TranslateModule,
    PageTitleComponent,
  ],
})
export class DeletedOrganizationsComponent implements OnInit {
  // ==================== DATA ====================
  deletedOrganizations: any[] = [];
  currentUserRole: string = 'Admin';

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'cityName', label: 'City', type: 'text' },
    { key: 'areaName', label: 'Area', type: 'text' },
    { key: 'countryName', label: 'Country', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'restore',
      icon: 'fas fa-trash-restore',
      action: (org: any) => this.confirmRestore(org),
    },
    {
      label: 'force_delete',
      icon: 'fas fa-trash-alt',
      action: (org: any) => this.confirmForceDelete(org),
    },
  ];

  // ==================== PAGINATION & SEARCH ====================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize: number | undefined = 5;
  searchQuery = '';

  constructor(
    private orgService: OrganizationService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeletedOrganizations();
  }

  // ==================== LOAD & FILTER ====================

  loadDeletedOrganizations(): void {
    this.orgService.getDeletedOrganizations().subscribe({
      next: (orgs: any[]) => {
        this.deletedOrganizations = orgs || [];
        // For paginated version:
        // this.orgService.getOrganizationsPaged({
        //   PageNumber: this.currentPage,
        //   PageSize: this.pageSize,
        //   SearchQuery: this.searchQuery,
        //   IncludeDeleted: true
        // }).subscribe({
        //   next: (response) => {
        //     this.deletedOrganizations = response.data || [];
        //     this.currentPage = response.currentPage;
        //     this.totalPages = response.totalPages;
        //     this.totalCount = response.totalCount;
        //     this.pageSize = response.pageSize;
        //   },
        //   error: (err) => console.error('Error loading deleted orgs:', err)
        // });
      },
      error: (err) =>
        console.error('Error loading deleted organizations:', err),
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDeletedOrganizations();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadDeletedOrganizations();
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadDeletedOrganizations();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'City', 'Area', 'Country', 'Deleted At']],
      body: this.deletedOrganizations.map((o) => [
        o.name,
        o.cityName,
        o.areaName,
        o.country,
        o.deletedAt,
      ]),
    });
    doc.save('deleted_organizations.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.deletedOrganizations.map((o) => ({
        Name: o.name,
        City: o.cityName,
        Area: o.areaName,
        Country: o.country,
        'Deleted At': o.deletedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deleted Organizations');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'deleted_organizations.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'City', 'Area', 'Country', 'Deleted At']],
      body: this.deletedOrganizations.map((o) => [
        o.name,
        o.cityName,
        o.areaName,
        o.country,
        o.deletedAt,
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
  confirmRestore(org: any): void {
    Swal.fire({
      title: 'Restore Organization',
      text: `Are you sure you want to restore ${org.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.orgService.restoreOrganization(org.id).subscribe({
          next: () => {
            Swal.fire(
              'Restored!',
              'The organization has been restored.',
              'success'
            );
            this.loadDeletedOrganizations();
          },
          error: (err) => {
            console.error('Error restoring organization:', err);
            Swal.fire(
              'Error!',
              'There was an error restoring the organization.',
              'error'
            );
          },
        });
      }
    });
  }

  confirmForceDelete(org: any): void {
    Swal.fire({
      title: 'Permanently Delete Organization',
      text: `This will permanently delete ${org.name}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.orgService.forceDeleteOrganization(org.id).subscribe({
          next: () => {
            Swal.fire(
              'Deleted!',
              'The organization has been permanently deleted.',
              'success'
            );
            this.loadDeletedOrganizations();
          },
          error: (err) => {
            console.error('Error force deleting organization:', err);
            Swal.fire(
              'Error!',
              'There was an error deleting the organization.',
              'error'
            );
          },
        });
      }
    });
  }
}
