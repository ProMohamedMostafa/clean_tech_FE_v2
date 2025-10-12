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
} from '../../../../../shared/components/table-data/table-data.component';
import { ReusableFilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-deleted-users',
  templateUrl: './deleted-users.component.html',
  styleUrls: ['./deleted-users.component.scss'],
  standalone: true,
  imports: [
    TableDataComponent,
    ReusableFilterBarComponent,
    TranslateModule,
    PageTitleComponent,
  ],
})
export class DeletedUsersComponent implements OnInit {
  // ==================== DATA ====================
  deletedUsers: any[] = [];
  currentUserRole: string = 'Admin'; // Replace with dynamic value if needed

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [
    { key: 'userName', label: 'Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'role', label: 'Role', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'restore',
      icon: 'fas fa-trash-restore',
      action: (user: any) => this.confirmRestore(user),
    },
    {
      label: 'force_delete',
      icon: 'fas fa-trash-alt',
      action: (user: any) => this.confirmForceDelete(user),
    },
  ];

  // ==================== PAGINATION & SEARCH ====================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize: number | undefined = 5;
  searchQuery = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeletedUsers();
  }

  // ==================== LOAD & FILTER ====================

  /** Fetch deleted users list from API */
  loadDeletedUsers(): void {
    this.userService.getDeletedUsers().subscribe({
      next: (response: any) => {
        this.deletedUsers = response || [];
        // If your API supports pagination for deleted items, use this instead:
        // this.userService
        //   .getUsersWithPagination({
        //     PageNumber: this.currentPage,
        //     PageSize: this.pageSize,
        //     Search: this.searchQuery,
        //     IncludeDeleted: true
        //   })
        //   .subscribe({
        //     next: (response: any) => {
        //       this.deletedUsers = response.data?.data || [];
        //       this.currentPage = response.data?.currentPage;
        //       this.totalPages = response.data?.totalPages;
        //       this.totalCount = response.data?.totalCount;
        //       this.pageSize = response.data?.pageSize;
        //     },
        //     error: (err) => console.error('Error loading deleted users:', err),
        //   });
      },
      error: (err) => console.error('Error loading deleted users:', err),
    });
  }

  /** Handle page change event */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDeletedUsers();
  }

  /** Handle page size change */
  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadDeletedUsers();
  }

  /** Handle search change */
  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadDeletedUsers();
  }

  // ==================== EXPORT & PRINT ====================

  /** Export deleted users list as PDF */
  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Email', 'Role', 'Deleted At']],
      body: this.deletedUsers.map((u) => [
        u.name,
        u.email,
        u.role,
        u.deletedAt,
      ]),
    });
    doc.save('deleted_users.pdf');
  }

  /** Export deleted users list as Excel */
  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.deletedUsers.map((u) => ({
        Name: u.name,
        Email: u.email,
        Role: u.role,
        'Deleted At': u.deletedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deleted Users');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'deleted_users.xlsx');
  }

  /** Print deleted users list as PDF */
  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Email', 'Role', 'Deleted At']],
      body: this.deletedUsers.map((u) => [
        u.name,
        u.email,
        u.role,
        u.deletedAt,
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
  confirmRestore(user: any): void {
    Swal.fire({
      title: 'Restore User',
      text: `Are you sure you want to restore ${user.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.restoreUser(user.id).subscribe({
          next: (success) => {
            if (success) {
              Swal.fire('Restored!', 'The user has been restored.', 'success');
              this.loadDeletedUsers();
            } else {
              Swal.fire(
                'Error!',
                'There was an error restoring the user.',
                'error'
              );
            }
          },
          error: (err) => {
            console.error('Error restoring user:', err);
            Swal.fire(
              'Error!',
              'There was an error restoring the user.',
              'error'
            );
          },
        });
      }
    });
  }

  confirmForceDelete(user: any): void {
    Swal.fire({
      title: 'Permanently Delete User',
      text: `This will permanently delete ${user.name}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.forceDeleteUser(user.id).subscribe({
          next: (success) => {
            if (success) {
              Swal.fire(
                'Deleted!',
                'The user has been permanently deleted.',
                'success'
              );
              this.loadDeletedUsers();
            } else {
              Swal.fire(
                'Error!',
                'There was an error deleting the user.',
                'error'
              );
            }
          },
          error: (err) => {
            console.error('Error force deleting user:', err);
            Swal.fire(
              'Error!',
              'There was an error deleting the user.',
              'error'
            );
          },
        });
      }
    });
  }
}
