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
import { SensorService } from '../../../services/sensor.service';

@Component({
  selector: 'app-deleted-sensors',
  templateUrl: './deleted-sensors.component.html',
  styleUrls: ['./deleted-sensors.component.scss'],
  standalone: true,
  imports: [
    TableDataComponent,
    ReusableFilterBarComponent,
    TranslateModule,
    PageTitleComponent,
  ],
})
export class DeletedSensorsComponent implements OnInit {
  // ==================== DATA ====================
  deletedSensors: any[] = [];
  currentUserRole: string = 'Admin';

  // ==================== TABLE CONFIG ====================
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'applicationName', label: 'Application', type: 'text' },
    { key: 'batteryLevel', label: 'Battery Level', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'restore',
      icon: 'fas fa-trash-restore',
      action: (sensor: any) => this.confirmRestore(sensor),
    },
    {
      label: 'force_delete',
      icon: 'fas fa-trash-alt',
      action: (sensor: any) => this.confirmForceDelete(sensor),
    },
  ];

  // ==================== PAGINATION & SEARCH ====================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 5;
  searchQuery = '';

  constructor(
    private sensorService: SensorService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeletedSensors();
  }

  // ==================== LOAD & FILTER ====================

  loadDeletedSensors(): void {
    this.sensorService.getDeletedDevices().subscribe({
      next: (response) => {
        if (response) {
          this.deletedSensors = response || [];
          this.totalCount = this.deletedSensors.length;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);

          // Apply search filter if needed
          if (this.searchQuery) {
            this.deletedSensors = this.deletedSensors.filter(
              (sensor) =>
                sensor.name
                  ?.toLowerCase()
                  .includes(this.searchQuery.toLowerCase()) ||
                sensor.serialNumber
                  ?.toLowerCase()
                  .includes(this.searchQuery.toLowerCase()) ||
                sensor.applicationName
                  ?.toLowerCase()
                  .includes(this.searchQuery.toLowerCase())
            );
          }

          // Apply pagination manually
          const startIndex = (this.currentPage - 1) * this.pageSize;
          const endIndex = startIndex + this.pageSize;
          this.deletedSensors = this.deletedSensors.slice(startIndex, endIndex);
        } else {
          this.deletedSensors = [];
        }
      },
      error: (err) => {
        console.error('Error loading deleted sensors:', err);
        this.deletedSensors = [];
        Swal.fire('Error!', 'Failed to load deleted sensors', 'error');
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDeletedSensors();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size || 5;
    this.currentPage = 1;
    this.loadDeletedSensors();
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadDeletedSensors();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Name',
          'Serial Number',
          'Application',
          'Battery Level',
          'Is Active',
          'Created At',
          'Deleted At',
        ],
      ],
      body: this.deletedSensors.map((s) => [
        s.name,
        s.serialNumber,
        s.applicationName,
        s.batteryLevel,
        s.isActive ? 'Yes' : 'No',
        s.createdAt,
        s.deletedAt,
      ]),
    });
    doc.save('deleted_sensors.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.deletedSensors.map((s) => ({
        Name: s.name,
        'Serial Number': s.serialNumber,
        Application: s.applicationName,
        'Battery Level': s.batteryLevel,
        'Is Active': s.isActive ? 'Yes' : 'No',
        'Created At': s.createdAt,
        'Deleted At': s.deletedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deleted Sensors');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'deleted_sensors.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Name',
          'Serial Number',
          'Application',
          'Battery Level',
          'Is Active',
          'Created At',
          'Deleted At',
        ],
      ],
      body: this.deletedSensors.map((s) => [
        s.name,
        s.serialNumber,
        s.applicationName,
        s.batteryLevel,
        s.isActive ? 'Yes' : 'No',
        s.createdAt,
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
  confirmRestore(sensor: any): void {
    Swal.fire({
      title: 'Restore Sensor',
      text: `Are you sure you want to restore "${sensor.name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.sensorService.restoreDevice(sensor.id).subscribe({
          next: (success) => {
            if (success) {
              Swal.fire(
                'Restored!',
                'The sensor has been restored.',
                'success'
              );
              this.loadDeletedSensors();
            } else {
              Swal.fire(
                'Error!',
                'There was an error restoring the sensor.',
                'error'
              );
            }
          },
          error: (err) => {
            console.error('Error restoring sensor:', err);
            Swal.fire(
              'Error!',
              'There was an error restoring the sensor.',
              'error'
            );
          },
        });
      }
    });
  }

  confirmForceDelete(sensor: any): void {
    Swal.fire({
      title: 'Permanently Delete Sensor',
      text: `This will permanently delete "${sensor.name}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Note: The service currently doesn't have a forceDelete method
        // You would need to implement this in the SensorService
        Swal.fire(
          'Error!',
          'Force delete functionality not implemented yet.',
          'error'
        );
        // If implemented, it would look like:
        // this.sensorService.forceDeleteDevice(sensor.id).subscribe(...)
      }
    });
  }
}
