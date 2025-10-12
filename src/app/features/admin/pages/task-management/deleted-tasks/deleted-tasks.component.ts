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
import { AuthService } from '../../../../auth/services/auth.service';
import Swal from 'sweetalert2';
import { TaskService } from '../../../../../shared/services/task.service';

@Component({
  selector: 'app-deleted-tasks',
  templateUrl: './deleted-tasks.component.html',
  styleUrls: ['./deleted-tasks.component.scss'],
  standalone: true,
  imports: [
    TableDataComponent,
    ReusableFilterBarComponent,
    TranslateModule,
    PageTitleComponent,
  ],
})
export class DeletedTasksComponent implements OnInit {
  // ==================== DATA ====================
  deletedTasks: any[] = [];
  currentUserRole: string = 'Admin';

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'priority', label: 'Priority', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'restore',
      icon: 'fas fa-trash-restore',
      action: (task: any) => this.confirmRestore(task),
    },
    {
      label: 'force_delete',
      icon: 'fas fa-trash-alt',
      action: (task: any) => this.confirmForceDelete(task),
    },
  ];

  // ==================== PAGINATION & SEARCH ====================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 5;
  searchQuery = '';

  constructor(
    private taskService: TaskService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeletedTasks();
  }

  // ==================== LOAD & FILTER ====================

  loadDeletedTasks(): void {
    this.taskService.getDeletedTasks().subscribe({
      next: (tasks) => {
        this.deletedTasks = tasks || [];
        // Note: Since getDeletedTasks returns TaskModel[], you might need to implement
        // pagination manually or add a paginated version to the service
        this.totalCount = this.deletedTasks.length;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);

        // Apply search filter if needed
        if (this.searchQuery) {
          this.deletedTasks = this.deletedTasks.filter(
            (task) =>
              task.title
                ?.toLowerCase()
                .includes(this.searchQuery.toLowerCase()) ||
              task.description
                ?.toLowerCase()
                .includes(this.searchQuery.toLowerCase()) ||
              task.assignedToName
                ?.toLowerCase()
                .includes(this.searchQuery.toLowerCase())
          );
        }

        // Apply pagination manually
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.deletedTasks = this.deletedTasks.slice(startIndex, endIndex);
      },
      error: (err) => {
        console.error('Error loading deleted tasks:', err);
        Swal.fire(
          'Error!',
          err.message || 'Failed to load deleted tasks',
          'error'
        );
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDeletedTasks();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size || 5;
    this.currentPage = 1;
    this.loadDeletedTasks();
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadDeletedTasks();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Title',
          'Description',
          'Priority',
          'Status',
          'Assigned To',
          'Created By',
          'Due Date',
          'Created At',
          'Deleted At',
        ],
      ],
      body: this.deletedTasks.map((t) => [
        t.title,
        t.description,
        t.priority,
        t.status,
        t.assignedToName,
        t.createdByName,
        t.dueDate,
        t.createdAt,
        t.deletedAt,
      ]),
    });
    doc.save('deleted_tasks.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.deletedTasks.map((t) => ({
        Title: t.title,
        Description: t.description,
        Priority: t.priority,
        Status: t.status,
        'Assigned To': t.assignedToName,
        'Created By': t.createdByName,
        'Due Date': t.dueDate,
        'Created At': t.createdAt,
        'Deleted At': t.deletedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deleted Tasks');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'deleted_tasks.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Title',
          'Description',
          'Priority',
          'Status',
          'Assigned To',
          'Created By',
          'Due Date',
          'Created At',
          'Deleted At',
        ],
      ],
      body: this.deletedTasks.map((t) => [
        t.title,
        t.description,
        t.priority,
        t.status,
        t.assignedToName,
        t.createdByName,
        t.dueDate,
        t.createdAt,
        t.deletedAt,
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
  confirmRestore(task: any): void {
    Swal.fire({
      title: 'Restore Task',
      text: `Are you sure you want to restore "${task.title}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.taskService.restoreTask(task.id).subscribe({
          next: (response) => {
            Swal.fire('Restored!', 'The task has been restored.', 'success');
            this.loadDeletedTasks();
          },
          error: (err) => {
            console.error('Error restoring task:', err);
            Swal.fire(
              'Error!',
              err.message || 'There was an error restoring the task.',
              'error'
            );
          },
        });
      }
    });
  }

  confirmForceDelete(task: any): void {
    Swal.fire({
      title: 'Permanently Delete Task',
      text: `This will permanently delete "${task.title}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.taskService.forceDeleteTask(task.id).subscribe({
          next: (response) => {
            Swal.fire(
              'Deleted!',
              'The task has been permanently deleted.',
              'success'
            );
            this.loadDeletedTasks();
          },
          error: (err) => {
            console.error('Error force deleting task:', err);
            Swal.fire(
              'Error!',
              err.message || 'There was an error deleting the task.',
              'error'
            );
          },
        });
      }
    });
  }
}
