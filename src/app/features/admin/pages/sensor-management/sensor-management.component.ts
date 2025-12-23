import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { PageTitleComponent } from '../../../../shared/components/page-title/page-title.component';
import { ReusableFilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { SensorContainerComponent } from '../../../../shared/components/sensor-container/sensor-container.component';
import { SensorFilterComponent } from '../../../../shared/components/filters/sensor-filter/sensor-filter.component';
import { SensorService } from '../../services/sensor.service';
import { getUserRole } from '../../../../core/helpers/auth.helpers';
import { AssignModalComponent } from '../../../../shared/components/sensor-card/assign-modal/assign-modal.component';
import {
  ExportConfig,
  ExportService,
} from '../../../../shared/services/export.service';
import { SensorReportService } from '../../../../shared/services/pdf-services/sensors/sensor-report.service';

@Component({
  selector: 'app-sensor-management',
  templateUrl: './sensor-management.component.html',
  styleUrls: ['./sensor-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PageTitleComponent,
    ReusableFilterBarComponent,
    SensorContainerComponent,
    SensorFilterComponent,
    AssignModalComponent,
  ],
})
export class SensorManagementComponent implements OnInit {
  @ViewChild(ReusableFilterBarComponent)
  filterBarComponent!: ReusableFilterBarComponent;
  @ViewChild(AssignModalComponent) assignModalComponent!: AssignModalComponent;

  loading: boolean = false;

  // Data properties
  devices: any[] = [];
  currentUserRole: string = 'Admin';
  filterData: any = {};
  showFilterModal: boolean = false;
  selectedSensor: any = null;
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 8;
  searchQuery = '';

  // Modal data object
  assignModalData: any = {
    sensorId: 0,
    sensorName: '',
    sensorDescription: '',
    pointId: null,
    organizationId: null,
    buildingId: null,
    floorId: null,
    sectionId: null,
  };

  constructor(
    private sensorService: SensorService,
    private router: Router,
    private sensorReportService: SensorReportService,
    private exportService: ExportService // Inject ExportService
  ) {}

  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.loadSensors();
  }

  // ==================== LOAD & FILTER ====================

  loadSensors(): void {
    this.loading = true;
    const filters: any = {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      SearchQuery: this.searchQuery,
      ...this.filterData,
    };

    this.sensorService
      .getDevices(
        filters.PageNumber,
        filters.PageSize,
        filters.SearchQuery,
        filters.applicationId,
        filters.areaId,
        filters.cityId,
        filters.organizationId,
        filters.buildingId,
        filters.floorId,
        filters.sectionId,
        filters.pointId,
        filters.isActive,
        filters.minBattery,
        filters.maxBattery,
        filters.isAssign
      )
      .subscribe({
        next: (response) => {
          if (response && response.succeeded) {
            const responseData = response.data;
            this.devices = responseData.data || [];
            this.currentPage = responseData.currentPage;
            this.totalPages = responseData.totalPages;
            this.totalCount = responseData.totalCount;
            this.pageSize = responseData.pageSize;
          } else {
            this.devices = [];
            this.resetPagination();
          }
          this.loading = false;
        },
        error: () => {
          this.devices = [];
          this.resetPagination();
          this.loading = false;
        },
      });
  }

  private resetPagination(): void {
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalCount = 0;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadSensors();
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadSensors();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = filterObj;
    this.currentPage = 1;
    this.loadSensors();
    this.closeFilterModal();
  }

  // ==================== RECYCLE BUTTON HANDLER ====================

  onRecycleButtonClick(): void {
    this.router.navigate(['/admin/deleted-sensors']);
  }

  // ==================== EXPORT & PRINT ====================

  /**
   * Download filtered sensor devices data as PDF
   * Now fetches data directly from SensorReportService
   */
  downloadAsPDF(): void {

    // Prepare PDF configuration based on SensorReportConfig interface
    const pdfConfig = {
      fileName: `sensors_${new Date().toISOString().split('T')[0]}`,
      pdfTitle: 'Sensors Report',

      headers: ['Name', 'Type', 'Status', 'Battery', 'Last Seen', 'Location'],

      columnKeys: [
        'name',
        'applicationName',
        'active',
        'battery',
        'lastSeenAt',
        'location',
      ],

      data: this.devices,

      columnFormatter: (device: any) => [
        device.name,
        device.applicationName,
        device.active ? 'Active' : 'Inactive',
        `${device.battery}%`,
        this.formatDate(device.lastSeenAt),
        `${device.organizationName || '--'} > ${
          device.buildingName || '--'
        } > ${device.floorName || '--'}`,
      ],

      includeCoverPage: true,

      reportInfo: {
        reportDate: new Date(),
        preparedBy: 'System',
      },
    };

    // Generate PDF via the service
    this.sensorReportService.generateSensorPDF(pdfConfig).subscribe({
      next: () => {
        this.showSuccess('PDF generated and downloaded successfully.');
      },
      error: (error) => {
        console.error('Error generating PDF:', error);
      },
    });
  }

  downloadAsExcel(): void {
    const exportConfig: ExportConfig = {
      fileName: 'sensors',
      sheetName: 'Sensors',
      headers: ['Name', 'Type', 'Status', 'Battery', 'Last Seen', 'Location'],
      data: this.devices,
      columnKeys: [
        'name',
        'applicationName',
        'active',
        'battery',
        'lastSeenAt',
        'location',
      ],
      columnFormatter: (device) => [
        device.name,
        device.applicationName,
        device.active ? 'Active' : 'Inactive',
        `${device.battery}%`,
        this.formatDate(device.lastSeenAt),
        `${device.organizationName || '--'} > ${
          device.buildingName || '--'
        } > ${device.floorName || '--'}`,
      ],
    };

    this.exportService.exportToExcel(exportConfig);
  }

  printPDF(): void {
    const exportConfig: ExportConfig = {
      fileName: 'sensors',
      headers: ['Name', 'Type', 'Status', 'Battery', 'Last Seen', 'Location'],
      data: this.devices,
      columnKeys: [
        'name',
        'applicationName',
        'active',
        'battery',
        'lastSeenAt',
        'location',
      ],
      columnFormatter: (device) => [
        device.name,
        device.applicationName,
        device.active ? 'Active' : 'Inactive',
        `${device.battery}%`,
        this.formatDate(device.lastSeenAt),
        `${device.organizationName || '--'} > ${
          device.buildingName || '--'
        } > ${device.floorName || '--'}`,
      ],
      pdfTitle: 'Sensors Report',
    };

    this.exportService.printPDF(exportConfig);
  }

  // ==================== QUICK EXPORT METHODS ====================

  /** Quick export using simplified methods */
  quickDownloadPDF(): void {
    const tableData = this.devices.map((device) => [
      device.name,
      device.applicationName,
      device.active ? 'Active' : 'Inactive',
      `${device.battery}%`,
      this.formatDate(device.lastSeenAt),
      `${device.organizationName || '--'} > ${device.buildingName || '--'} > ${
        device.floorName || '--'
      }`,
    ]);

    this.exportService.quickPDF(
      'sensors',
      ['Name', 'Type', 'Status', 'Battery', 'Last Seen', 'Location'],
      tableData
    );
  }

  quickDownloadExcel(): void {
    const tableData = this.devices.map((device) => [
      device.name,
      device.applicationName,
      device.active ? 'Active' : 'Inactive',
      `${device.battery}%`,
      this.formatDate(device.lastSeenAt),
      `${device.organizationName || '--'} > ${device.buildingName || '--'} > ${
        device.floorName || '--'
      }`,
    ]);

    this.exportService.quickExcel(
      'sensors',
      ['Name', 'Type', 'Status', 'Battery', 'Last Seen', 'Location'],
      tableData
    );
  }

  // ==================== MODAL ACTIONS ====================

  openFilterModal(): void {
    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  // ==================== SENSOR ACTIONS ====================

  onAssignLocation(device: any): void {
    this.assignModalData = {
      sensorId: device.id,
      sensorName: device.name || '',
      sensorDescription: device.description || '',
      pointId: device.pointId || null,
      organizationId: device.organizationId || null,
      buildingId: device.buildingId || null,
      floorId: device.floorId || null,
      sectionId: device.sectionId || null,
    };

    const modalElement = document.getElementById('assignLocationModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  onEditSensor(event: any): void {
    this.selectedSensor = event;
    // Handle edit sensor logic here
  }

  onReloadSensor(deviceId: number): void {
    this.sensorService.getDeviceDetails(deviceId).subscribe({
      next: () => {
        this.showSuccess('Sensor data reloaded successfully');
        this.loadSensors();
      },
      error: () => {
        this.showError('Failed to reload sensor data');
      },
    });
  }

  onToggleStatus(deviceId: number): void {
    // Just show SweetAlert
    Swal.fire({
      icon: 'success',
      title: 'Success',
      timer: 2000,
      showConfirmButton: false,
      position: 'center',
      toast: false,
    });
  }

  onViewDetails(deviceId: number): void {
    this.router.navigate(['admin', 'sensor-details', deviceId]);
  }

  handleSensorUpdated(): void {
    this.loadSensors();
  }

  handleAssignSuccess(): void {
    this.loadSensors();
    this.closeAssignModal();
  }

  closeAssignModal(): void {
    const modalElement = document.getElementById('assignLocationModal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  // ==================== HELPER METHODS ====================

  private formatDate(dateString: string): string {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  private showSuccess(message: string): void {
    Swal.fire({ icon: 'success', title: 'Success', text: message });
  }

  private showError(message: string): void {
    Swal.fire({ icon: 'error', title: 'Error', text: message });
  }

  isAdmin(): boolean {
    return this.currentUserRole === 'Admin';
  }

  isAdminOrManager(): boolean {
    return (
      this.currentUserRole === 'Admin' || this.currentUserRole === 'Manager'
    );
  }
}
