import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

// Components
import { DeviceContainerComponent } from '../../../components/feedback-module/device-container/device-container.component';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';
import { FeedbackFilterBarComponent } from '../../../components/feedback-module/feedback-filter-bar/feedback-filter-bar.component';
import { FeedbackFilterComponent } from '../../../components/feedback-module/feedback-filter/feedback-filter.component';

// Models and Services
import {
  Device,
  DeviceListResponse,
  DeviceResponse,
} from '../../../models/feedback/device.model';
import { DevicesService } from '../../../services/feedback/devices.service';
import { CreateDeviceModalComponent } from '../../../components/feedback-module/create-device-modal/create-device-modal.component';

interface DeviceFilters {
  PageNumber?: number;
  PageSize?: number;
  SearchQuery?: string;
  SectionId?: number;
}

@Component({
  selector: 'app-device-management',
  templateUrl: './device-management.component.html',
  styleUrls: ['./device-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PageTitleComponent,
    FeedbackFilterBarComponent,
    DeviceContainerComponent,
    FeedbackFilterComponent,
    CreateDeviceModalComponent,
  ],
})
export class DeviceManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  showFilterModal = false;
  isLoading = false;
  currentUserRole = 'Admin';
  showCreateModal = false;

  // Modal mode and edit data
  modalMode: 'create' | 'edit' = 'create';
  editingDevice: Device | null = null;

  // Device data
  devices: Device[] = [];
  selectedDeviceIds: number[] = [];

  // Pagination
  currentPage = 1;
  totalPages = 0;
  totalCount = 0;
  pageSize = 8;

  // Search and filters
  searchQuery = '';
  filters: any = {
    sectionId: undefined,
  };

  constructor(private devicesService: DevicesService, private router: Router) {}

  ngOnInit(): void {
    this.loadDevices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================================
  // DATA LOADING METHODS
  // ================================

  loadDevices(): void {
    this.isLoading = true;

    const filters: DeviceFilters = {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      SearchQuery: this.searchQuery,
      SectionId: this.filters.sectionId,
    };

    this.devicesService
      .getDevices(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((response: DeviceListResponse | null) => {
        if (response?.succeeded && response.data?.data) {
          this.devices = response.data.data || [];
          this.totalCount = response.data.totalCount || 0;
          this.totalPages = response.data.totalPages || 0;
        } else {
          this.resetDeviceData();
        }
      });
  }

  private resetDeviceData(): void {
    this.devices = [];
    this.totalCount = 0;
    this.totalPages = 0;
    this.currentPage = 1;
  }

  refreshDevices(): void {
    this.currentPage = 1;
    this.loadDevices();
  }

  // ================================
  // CREATE/EDIT DEVICE OPERATIONS
  // ================================

  onCreateDevice(): void {
    this.modalMode = 'create';
    this.editingDevice = null;
    this.showCreateModal = true;
  }

  handleCreate(device: any | null): void {
    if (!device) {
      return;
    }

    this.isLoading = true;

    // Extract the required properties from the Device object
    const deviceData = {
      name: device.name,
      sectionId: device.sectionId,
    };

    this.devicesService
      .createDevice(deviceData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((response: DeviceResponse | null) => {
        if (response?.succeeded) {
          this.showAlert(
            'success',
            response.message || 'Device created successfully!'
          );
          this.loadDevices();
          this.closeCreateModal();
        }
      });
  }

  handleEdit(device: any | null): void {
    if (!device || !this.editingDevice?.id) return;

    this.isLoading = true;
    const payload = {
      id: this.editingDevice.id,
      name: device.name,
      sectionId: device.sectionId,
    };

    this.devicesService
      .updateDevice(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((response: DeviceResponse) => {
        if (response?.succeeded) {
          this.showAlert(
            'success',
            response.message || 'Device updated successfully!'
          );
          this.loadDevices();
          this.closeCreateModal();
        }
      });
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.modalMode = 'create';
    this.editingDevice = null;
  }

  // ================================
  // SEARCH & PAGINATION HANDLERS
  // ================================

  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadDevices();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDevices();
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.loadDevices();
  }

  // ================================
  // DEVICE OPERATIONS
  // ================================

  onEditDevice(device: Device): void {
    this.modalMode = 'edit';
    this.editingDevice = device;
    this.showCreateModal = true;
  }

  onViewDevice(device: Device): void {
    if (!device.id) return;
    this.router.navigate(['admin/device-details', device.id]);
  }

  onDeleteDevice(device: Device): void {
    if (!device.id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.devicesService
          .deleteDevice(device.id!)
          .pipe(takeUntil(this.destroy$))
          .subscribe((success: boolean) => {
            if (success) {
              this.showAlert('success', 'Device deleted successfully!');
              this.loadDevices();
            }
          });
      }
    });
  }

  onBulkDelete(): void {
    if (this.selectedDeviceIds.length === 0) {
      this.showAlert('warning', 'Please select at least one device to delete.');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `You're about to delete ${this.selectedDeviceIds.length} devices.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete them!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;

        // Delete all selected devices sequentially
        const deleteObservables = this.selectedDeviceIds.map((id) =>
          this.devicesService.deleteDevice(id).pipe(takeUntil(this.destroy$))
        );

        // For parallel deletion, you could use forkJoin, but sequential is safer
        let completed = 0;
        const total = deleteObservables.length;

        const processNext = () => {
          if (completed >= total) {
            this.isLoading = false;
            this.showAlert('success', `${total} devices deleted successfully!`);
            this.selectedDeviceIds = [];
            this.loadDevices();
            return;
          }

          deleteObservables[completed].subscribe((success: boolean) => {
            completed++;
            processNext();
          });
        };

        processNext();
      }
    });
  }

  // ================================
  // FILTER METHODS
  // ================================

  openFilterModal(): void {
    this.showFilterModal = true;
  }

  onFilterChange(filters: any): void {
    this.filters = {
      ...this.filters,
      ...filters,
    };

    this.currentPage = 1;
    this.loadDevices();
    this.showFilterModal = false;
  }

  // ================================
  // DEVICE CONTAINER EVENTS
  // ================================

  onReloadDevice(device: Device): void {
    this.refreshDevices();
  }

  onToggleDeviceStatus(device: Device): void {
    // Implement actual status toggle logic here
  }

  onAssignDevice(device: Device): void {
    // Implement assign logic here
  }

  onCollapseAll(): void {
    // Implement collapse all logic
  }

  onExpandAll(): void {
    // Implement expand all logic
  }

  // ================================
  // UTILITY METHODS
  // ================================

  isAdmin(): boolean {
    return this.currentUserRole === 'Admin';
  }

  private showAlert(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string
  ): void {
    const config = {
      success: { title: 'Success!', icon: 'success' as const },
      error: { title: 'Error!', icon: 'error' as const },
      warning: { title: 'Warning!', icon: 'warning' as const },
      info: { title: 'Info', icon: 'info' as const },
    };

    Swal.fire({
      title: config[type].title,
      text: message,
      icon: config[type].icon,
      confirmButtonText: 'OK',
    });
  }
}
