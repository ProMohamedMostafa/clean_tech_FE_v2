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
import { ShiftService } from '../../../services/shift.service';
import { AuthService } from '../../../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-deleted-shifts',
  templateUrl: './deleted-shifts.component.html',
  styleUrls: ['./deleted-shifts.component.scss'],
  standalone: true,
  imports: [
    TableDataComponent,
    ReusableFilterBarComponent,
    TranslateModule,
    PageTitleComponent,
  ],
})
export class DeletedShiftsComponent implements OnInit {
  // ==================== DATA ====================
  deletedShifts: any[] = [];
  currentUserRole: string = 'Admin';

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'endDate', label: 'End Date', type: 'date' },
    { key: 'startTime', label: 'Start Time', type: 'text' },
    { key: 'endTime', label: 'End Time', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'restore',
      icon: 'fas fa-trash-restore',
      action: (shift: any) => this.confirmRestore(shift),
    },
    {
      label: 'force_delete',
      icon: 'fas fa-trash-alt',
      action: (shift: any) => this.confirmForceDelete(shift),
    },
  ];

  // ==================== PAGINATION & SEARCH ====================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize: number | undefined = 5;
  searchQuery = '';

  constructor(
    private shiftService: ShiftService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeletedShifts();
  }

  // ==================== LOAD & FILTER ====================

  loadDeletedShifts(): void {
    this.shiftService.getDeletedShifts().subscribe({
      next: (response) => {
        this.deletedShifts = response?.data || [];
        // For paginated version, you could implement similar to sections:
        // this.shiftService.getPaginatedShifts({
        //   pageNumber: this.currentPage,
        //   pageSize: this.pageSize,
        //   search: this.searchQuery,
        //   // Add other filters as needed
        // }).subscribe({
        //   next: (response) => {
        //     if (response) {
        //       this.deletedShifts = response.data || [];
        //       this.currentPage = response.currentPage;
        //       this.totalPages = response.totalPages;
        //       this.totalCount = response.totalCount;
        //       this.pageSize = response.pageSize;
        //     }
        //   },
        //   error: (err) => console.error('Error loading deleted shifts:', err)
        // });
      },
      error: (err) => console.error('Error loading deleted shifts:', err),
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDeletedShifts();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadDeletedShifts();
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadDeletedShifts();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Name',
          'Start Date',
          'End Date',
          'Start Time',
          'End Time',
          'Point',
          'Section',
          'Floor',
          'Building',
          'Organization',
          'Deleted At',
        ],
      ],
      body: this.deletedShifts.map((s) => [
        s.name,
        s.startDate,
        s.endDate,
        s.startTime,
        s.endTime,
        s.pointName,
        s.sectionName,
        s.floorName,
        s.buildingName,
        s.organizationName,
        s.deletedAt,
      ]),
    });
    doc.save('deleted_shifts.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.deletedShifts.map((s) => ({
        Name: s.name,
        'Start Date': s.startDate,
        'End Date': s.endDate,
        'Start Time': s.startTime,
        'End Time': s.endTime,
        Point: s.pointName,
        Section: s.sectionName,
        Floor: s.floorName,
        Building: s.buildingName,
        Organization: s.organizationName,
        'Deleted At': s.deletedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deleted Shifts');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'deleted_shifts.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Name',
          'Start Date',
          'End Date',
          'Start Time',
          'End Time',
          'Point',
          'Section',
          'Floor',
          'Building',
          'Organization',
          'Deleted At',
        ],
      ],
      body: this.deletedShifts.map((s) => [
        s.name,
        s.startDate,
        s.endDate,
        s.startTime,
        s.endTime,
        s.pointName,
        s.sectionName,
        s.floorName,
        s.buildingName,
        s.organizationName,
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
  confirmRestore(shift: any): void {
    Swal.fire({
      title: 'Restore Shift',
      text: `Are you sure you want to restore ${shift.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.shiftService.restoreShift(shift.id).subscribe({
          next: (success) => {
            if (success) {
              Swal.fire('Restored!', 'The shift has been restored.', 'success');
              this.loadDeletedShifts();
            } else {
              Swal.fire(
                'Error!',
                'There was an error restoring the shift.',
                'error'
              );
            }
          },
          error: (err) => {
            console.error('Error restoring shift:', err);
            Swal.fire(
              'Error!',
              'There was an error restoring the shift.',
              'error'
            );
          },
        });
      }
    });
  }

  confirmForceDelete(shift: any): void {
    Swal.fire({
      title: 'Permanently Delete Shift',
      text: `This will permanently delete ${shift.name}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.shiftService.forceDeleteShift(shift.id).subscribe({
          next: (success) => {
            if (success) {
              Swal.fire(
                'Deleted!',
                'The shift has been permanently deleted.',
                'success'
              );
              this.loadDeletedShifts();
            } else {
              Swal.fire(
                'Error!',
                'There was an error deleting the shift.',
                'error'
              );
            }
          },
          error: (err) => {
            console.error('Error force deleting shift:', err);
            Swal.fire(
              'Error!',
              'There was an error deleting the shift.',
              'error'
            );
          },
        });
      }
    });
  }
}
