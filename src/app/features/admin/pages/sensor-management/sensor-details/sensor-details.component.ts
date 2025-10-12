import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

import { TaskContainerComponent } from '../../../../../shared/components/task-container/task-container.component';
import { AssignModalComponent } from '../../../../../shared/components/sensor-card/assign-modal/assign-modal.component';
import { SensorDetailsInfoComponent } from './sensor-details-info/sensor-details-info.component';

import { TaskService } from '../../../../../shared/services/task.service';
import { CalendarService } from '../../../../../shared/services/calendar.service';

import { TaskFilters } from '../../../../../shared/models/task.model';
import { Device } from '../../../models/sensor.model';
import { SensorService } from '../../../services/sensor.service';

export enum TaskStatus {
  Pending = 0,
  InProgress = 1,
  WaitingForApproval = 2,
  Completed = 3,
  Rejected = 4,
  NotResolved = 5,
  Overdue = 6,
}

@Component({
  selector: 'app-sensor-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterModule,
    TaskContainerComponent,
    SensorDetailsInfoComponent,
    AssignModalComponent,
  ],
  templateUrl: './sensor-details.component.html',
  styleUrl: './sensor-details.component.scss',
})
export class SensorDetailsComponent implements OnInit, OnChanges {
  // Enums and Interfaces
  TaskStatus = TaskStatus;

  // Output Events
  @Output() tasksChanged = new EventEmitter<any>();

  // Component Properties
  tasks: any[] = [];
  currentPage = 1;
  totalPages = 0;
  pageSize = 12;
  totalCount = 0;
  device: Device = {
    id: 0,
    name: '',
    description: '',
  } as Device;
  selectedLimit: { key: string; min: number; max: number } | null = null;
  assignModalData: any = {
    sensorId: 0,
    sensorName: '',
    sensorDescription: '',
    pointId: null,
    organizationId: null,
    buildingId: null,
    floorId: null,
    sectionId: null,
    show: false,
  };
  isEditing = false;
  editMin!: number;
  editMax!: number;
  selectedFilters: any = {};
  selectedStatusValue: number | null = null;
  isStatusFilterActive: boolean = false;
  deviceId!: number;
  isLoading: boolean = false;

  constructor(
    private taskService: TaskService,
    private calendarService: CalendarService,
    private route: ActivatedRoute,
    private router: Router,
    private sensorService: SensorService,
    private location: Location
  ) {}

  // Lifecycle Hooks
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.deviceId = id;
    this.setupQueryParamSubscription();
    this.loadPaginatedTasks();
    this.loadDeviceDetails(id);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['outselectedDate'] && changes['outselectedDate'].currentValue) {
      this.handleDateChange(changes['outselectedDate'].currentValue);
    }
  }

  // Sensor Related Methods
  loadDeviceDetails(id: number): void {
    if (!id) {
      this.handleAccessDenied();
      return;
    }

    this.sensorService.getDeviceDetails(id).subscribe({
      next: (res) => {
        if (res) {
          this.device = res;
          this.updateAssignModalData();
        } else {
          this.handleAccessDenied();
        }
      },
      error: (err) => {
        console.error('Error loading device details:', err);
        this.handleAccessDenied();
      },
    });
  }

  updateAssignModalData(): void {
    this.assignModalData = {
      sensorId: this.device.id,
      sensorName: this.device.name || '',
      sensorDescription: this.device.description || '',
      pointId: this.device.pointId || null,
      organizationId: this.device.organizationId || null,
      buildingId: this.device.buildingId || null,
      floorId: this.device.floorId || null,
      sectionId: this.device.sectionId || null,
      show: false,
    };
  }

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
      show: true,
    };
  }

  onSensorUpdated(): void {
    this.loadDeviceDetails(this.device.id);
  }

  // Sensor Limit Methods
  onSelectOption(item: any): void {
    if (
      this.device.limit &&
      this.device.limit.key === item.key &&
      this.device.limit.min != null &&
      this.device.limit.max != null
    ) {
      this.selectedLimit = {
        key: item.key,
        min: this.device.limit.min,
        max: this.device.limit.max,
      };
    } else {
      this.selectedLimit = {
        key: item.key,
        min: 0,
        max: 0,
      };
    }
  }

  onSaveLimit(): void {
    console.log('🔍 Checking before save...');
    console.log('👉 Device:', this.device);
    console.log('👉 Selected Limit:', this.selectedLimit);

    // Check if device exists and has an ID
    if (!this.device?.id) {
      console.warn('❌ Missing device. Aborting save.');
      return;
    }

    // Check if selectedLimit has the required properties
    if (
      !this.selectedLimit?.key ||
      this.selectedLimit?.min === undefined ||
      this.selectedLimit?.max === undefined
    ) {
      console.warn('❌ Incomplete limit data. Aborting save.');
      Swal.fire({
        icon: 'error',
        title: 'Incomplete Data',
        text: 'Please provide both minimum and maximum values.',
      });
      return;
    }

    const payload = {
      deviceId: this.device.id,
      key: this.selectedLimit.key,
      min: this.selectedLimit.min,
      max: this.selectedLimit.max,
    };

    console.log('✅ Payload prepared:', payload);

    if (payload.min >= payload.max) {
      console.error('⚠️ Invalid range: min >= max', payload);
      Swal.fire({
        icon: 'error',
        title: 'Invalid Range',
        text: 'Min should be less than Max!',
      });
      return;
    }

    const reloadDevice = () => {
      this.sensorService.getDeviceDetails(this.device.id).subscribe((res) => {
        console.log('🔄 Reloading device details...');
        if (res) {
          console.log('✅ Device reloaded:', res);
          this.device = res;
          this.selectedLimit = null;
        } else {
          console.warn('⚠️ Device reload returned null/undefined');
        }
      });
    };

    if (!this.device.limit) {
      console.log('🟢 No limit exists. Creating new limit...');
      this.sensorService.createDeviceLimit(payload).subscribe((success) => {
        if (success) {
          console.log('✅ Limit created successfully.');
          Swal.fire({
            icon: 'success',
            title: 'Limit Created',
            text: 'The new limit was created successfully!',
          });
          reloadDevice();
        } else {
          console.error('❌ Limit creation failed.');
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            text: 'Could not create the limit. Please try again.',
          });
        }
      });
    } else {
      console.log('🟡 Limit exists. Updating limit...');
      this.sensorService.editDeviceLimit(payload).subscribe((success) => {
        if (success) {
          console.log('✅ Limit updated successfully.');
          Swal.fire({
            icon: 'success',
            title: 'Limit Updated',
            text: 'The limit was updated successfully!',
          });
          reloadDevice();
        } else {
          console.error('❌ Limit update failed.');
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: 'Could not update the limit. Please try again.',
          });
        }
      });
    }
  }
  deleteLimit(): void {
    if (!this.device.id) {
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'No data available to delete.',
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this deletion!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.sensorService
          .deleteDeviceLimit(this.device.id)
          .subscribe((success) => {
            if (success) {
              Swal.fire('Deleted!', 'Limit has been deleted.', 'success');
              this.selectedLimit = null;
              this.sensorService
                .getDeviceDetails(this.device.id)
                .subscribe((res) => {
                  if (res) {
                    this.device = res;
                  }
                });
            } else {
              Swal.fire('Error!', 'Failed to delete the limit.', 'error');
            }
          });
      }
    });
  }

  // Sensor Utility Methods
  getHoursSinceLastSeen(): number {
    if (!this.device?.lastSeenAt) return 0;
    const lastSeen = new Date(this.device.lastSeenAt);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60));
  }

  getValueByKey(key: string): string {
    return (
      this.device?.data
        ?.find((d) => d.key.toLowerCase() === key.toLowerCase())
        ?.value?.toString() ?? '-'
    );
  }

  // Task Related Methods
  loadPaginatedTasks(): void {
    this.isLoading = true;

    const filters: TaskFilters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      ...this.selectedFilters,
      DeviceId: this.deviceId,
    };

    this.taskService.getTasks(filters).subscribe({
      next: (response) => {
        this.handleTaskResponse(response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.handleErrorResponse();
        this.isLoading = false;
      },
    });
  }

  onFilterChange(filterData: any) {
    this.selectedFilters = { ...filterData };
    this.emitTaskData();
    this.loadPaginatedTasks();
  }

  onSearchChange(searchQuery: string) {
    this.selectedFilters.search = searchQuery;
    this.loadPaginatedTasks();
    this.emitTaskData();
  }

  onStatusFilterChange(selectedOption: string): void {
    this.selectedFilters = { ...this.selectedFilters };
    delete this.selectedFilters.status;

    switch (selectedOption) {
      case 'opt1':
        delete this.selectedFilters.status;
        break;
      case 'opt2':
        this.selectedFilters.status = TaskStatus.Pending;
        break;
      case 'opt3':
        this.selectedFilters.status = TaskStatus.InProgress;
        break;
      case 'opt4':
        this.selectedFilters.status = TaskStatus.Completed;
        break;
      case 'opt5':
        this.selectedFilters.status = TaskStatus.NotResolved;
        break;
      case 'opt6':
        this.selectedFilters.status = TaskStatus.Overdue;
        break;
    }

    this.currentPage = 1;
    this.loadPaginatedTasks();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPaginatedTasks();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadPaginatedTasks();
  }

  getStatusName(statusId: number): string {
    const statusMap: { [key: number]: string } = {
      0: 'Pending',
      1: 'In Progress',
      2: 'Waiting For Approval',
      3: 'Completed',
      4: 'Rejected',
      5: 'Not Resolved',
      6: 'Overdue',
    };
    return statusMap[statusId] || 'Unknown';
  }

  // Task Navigation Methods
  navigateToEdit(taskId: number): void {
    if (!taskId) {
      console.error('Invalid task ID');
      return;
    }

    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const role = user.role?.toLowerCase() || 'admin';
        this.router.navigate([`${role}/edit-task/${taskId}`]);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.router.navigate([`admin/edit-task/${taskId}`]);
      }
    } else {
      this.router.navigate([`admin/edit-task/${taskId}`]);
    }
  }

  navigateToView(taskId: number): void {
    if (!taskId) {
      console.error('Invalid task ID');
      return;
    }

    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const role = user.role?.toLowerCase() || 'admin';
        this.router.navigate([`${role}/task-details/${taskId}`]);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.router.navigate([`admin/task-details/${taskId}`]);
      }
    } else {
      this.router.navigate([`admin/task-details/${taskId}`]);
    }
  }

  deleteTask(taskId: number): void {
    if (!taskId) {
      console.error('Invalid task ID');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.taskService.deleteTask(taskId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The task has been deleted.', 'success');
            this.loadPaginatedTasks();
          },
          error: (error) => {
            console.error('Error deleting task:', error);
            Swal.fire('Error!', 'Failed to delete the task.', 'error');
          },
        });
      }
    });
  }

  // Location Navigation Methods
  navigateToArea(id: number): void {
    this.router.navigate(['/admin/area-details', id]);
  }

  navigateToCity(id?: number): void {
    if (id) {
      this.router.navigate(['/admin/city-details', id]);
    }
  }

  navigateToOrganization(id: number): void {
    this.router.navigate(['/admin/organization-details', id]);
  }

  navigateToBuilding(id: number): void {
    this.router.navigate(['/admin/building-details', id]);
  }

  navigateToFloor(id: number): void {
    this.router.navigate(['/admin/floor-details', id]);
  }

  navigateToSection(id: number): void {
    this.router.navigate(['/admin/section-details', id]);
  }

  navigateToPoint(id: number): void {
    this.router.navigate(['/admin/point-details', id]);
  }

  // Modal Methods
  showAssignModal(): void {
    this.assignModalData = {
      sensorId: this.device.id,
      sensorName: this.device.name || '',
      sensorDescription: this.device.description || '',
      pointId: this.device.pointId || null,
      organizationId: this.device.organizationId || null,
      buildingId: this.device.buildingId || null,
      floorId: this.device.floorId || null,
      sectionId: this.device.sectionId || null,
      show: true,
    };

    const modalElement = document.getElementById('assignLocationModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  closeAssignModal(): void {
    this.assignModalData.show = false;
    const modalElement = document.getElementById('assignLocationModal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  handleAssignSuccess(): void {
    this.loadDeviceDetails(this.deviceId);
    this.closeAssignModal();
  }

  handleModalClose(): void {
    this.assignModalData.show = false;
  }

  // Device Management Methods
  deleteDevice(id: number) {
    console.log(id);

    Swal.fire({
      title: 'Are you sure?',
      text: 'This action will delete the device!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.sensorService.softDeleteDevice(id).subscribe((success) => {
          if (success) {
            Swal.fire(
              'Deleted!',
              'The device has been deleted.',
              'success'
            ).then(() => {
              this.router.navigate(['/admin/sensor']);
            });
          } else {
            Swal.fire('Error', 'Could not delete the device.', 'error');
          }
        });
      }
    });
  }

  // Filter Methods
  resetFilters() {
    this.selectedFilters = {};
    this.router.navigate([], {
      queryParams: { status: null },
      queryParamsHandling: 'merge',
    });
    this.loadPaginatedTasks();
  }

  clearStatusFilter(): void {
    this.selectedStatusValue = null;
    delete this.selectedFilters.status;
    this.isStatusFilterActive = false;
    this.updateUrlWithoutStatus();
    this.loadPaginatedTasks();
  }

  // Private Helper Methods
  private handleAccessDenied(): void {
    Swal.fire({
      icon: 'error',
      title: 'Access Denied',
      text: 'You do not have permission to view this sensor details.',
      confirmButtonText: 'Go Back',
    }).then(() => {
      this.location.back();
    });
  }

  private handleDateChange(newDate: string): void {
    if (newDate) {
      this.selectedFilters.startDate = newDate;
      this.selectedFilters.endDate = newDate;
      this.loadPaginatedTasks();
    } else {
      delete this.selectedFilters.startDate;
      delete this.selectedFilters.endDate;
      this.loadPaginatedTasks();
    }
  }

  private setupQueryParamSubscription(): void {
    this.route.queryParams.subscribe((params) => {
      this.handleStatusParam(params);
      this.handlePriorityParam(params);
      this.loadPaginatedTasks();
    });
  }

  private handleStatusParam(params: any): void {
    if (params['status'] !== undefined) {
      this.selectedStatusValue = +params['status'];
      this.selectedFilters.status = this.selectedStatusValue;
      this.isStatusFilterActive = true;
    } else {
      this.isStatusFilterActive = false;
    }

    this.router.navigate([], {
      queryParams: { status: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private handlePriorityParam(params: any): void {
    if (params['priority'] !== undefined) {
      this.selectedFilters.priority = params['priority'];
    }
  }

  private handleTaskResponse(response: any): void {
    if (!response || !response.data) {
      console.error('Invalid API response structure:', response);
      this.handleErrorResponse();
      return;
    }

    this.tasks = Array.isArray(response.data) ? response.data : [];
    this.currentPage = response.data.currentPage || 1;
    this.totalPages = response.data.totalPages || 0;
    this.totalCount = response.data.totalCount || 0;

    this.emitTaskData();
  }

  private handleErrorResponse(): void {
    this.tasks = [];
    this.currentPage = 1;
    this.totalPages = 0;
    this.totalCount = 0;
    this.emitTaskData();
  }

  private emitTaskData() {
    this.tasksChanged.emit(this.tasks || []);
  }

  private updateUrlWithoutStatus(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { status: null },
      queryParamsHandling: 'merge',
    });
  }
}
