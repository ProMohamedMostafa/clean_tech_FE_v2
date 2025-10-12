// ==================== IMPORTS ====================
// Angular Core & Modules
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material Design Modules
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

// Third-party Libraries
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

// Models & Services
import { TaskCreateModel } from '../../../../../shared/models/task.model';
import { TaskService } from '../../../../../shared/services/task.service';
import { FilterBarService } from '../../../../../shared/services/filter-bar.service';
import { ShiftService } from '../../../services/shift.service';

// Utilities & Helpers
import { getUserRole } from '../../../../../core/helpers/auth.helpers';

// ==================== INTERFACES ====================
/** Represents a basic dropdown item with ID and name */
interface DropdownItem {
  id: number;
  name: string;
}

/** Extends DropdownItem with a flag indicating if the point is countable */
interface Point extends DropdownItem {
  isCountable: boolean;
}

/** Represents a shift with timing information */
interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  pointId?: number;
}

/** Represents an uploaded file with metadata */
interface UploadedFile {
  id?: number;
  name: string;
  size: number;
  preview: string;
  file?: File;
  path?: string;
  type: string;
  isExisting: boolean;
}

// ==================== COMPONENT DEFINITION ====================
@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
  ],
})
export class TaskFormComponent implements OnInit {
  // ==================== VIEW REFERENCES ====================
  @ViewChild('fileInput') fileInput?: ElementRef;

  // ==================== STATE FLAGS ====================
  /** Form submission and validation flags */
  isSubmitting = false;
  submissionSuccess = false;
  submissionError = false;
  dateError = false;
  uploadSuccess = false;
  uploadError = false;

  /** Component mode flags */
  isEditMode = false;
  isLoading = false;
  taskId: number | null = null;

  // ==================== FORM DATA ====================
  /** Main task form model */
  taskModel: TaskCreateModel = {
    title: '',
    description: '',
    priority: 0,
    status: 0,
    startDate: '',
    endDate: '',
    buildingId: undefined,
    floorId: undefined,
    pointId: undefined,
    sectionId: undefined,
    userIds: [],
    files: [],
    createdBy: 0,
    startTime: '',
    endTime: '',
  };

  // ==================== LOCATION & HIERARCHY DATA ====================
  /** Location hierarchy dropdown data */
  floors: DropdownItem[] = [];
  sections: DropdownItem[] = [];
  points: Point[] = [];
  users: DropdownItem[] = [];
  shifts: Shift[] = [];

  /** Current location selections */
  selectedLevel = '';
  selectedFloor: number | null = null;
  selectedSection: number | null = null;
  selectedPoint: number | null = null;
  selectedShift: number | null = null;

  // ==================== FILE HANDLING DATA ====================
  /** File upload and management */
  uploadedFiles: UploadedFile[] = [];
  filesToDelete: number[] = [];

  // ==================== TASK-SPECIFIC DATA ====================
  /** Point-specific properties */
  isCountable = false;
  Currently_reading: number | null = null;

  // ==================== CONSTRUCTOR & DEPENDENCY INJECTION ====================
  constructor(
    private taskService: TaskService,
    private filterBarService: FilterBarService,
    private shiftService: ShiftService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeUserData();
  }

  // ==================== LIFECYCLE HOOKS ====================
  ngOnInit(): void {
    this.checkRouteMode();
    this.loadInitialData();
  }

  // ==================== COMPONENT INITIALIZATION ====================
  /** Initialize user data from localStorage */
  private initializeUserData(): void {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.taskModel.createdBy = userData?.id || 0;
  }

  /** Check if component is in edit mode based on route parameters */
  private checkRouteMode(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.taskId = Number(id);
        this.loadTaskDetails();
      }
    });
  }

  /** Load initial data based on component mode */
  private loadInitialData(): void {
    this.loadUsers();

    // Load floors directly for create mode
    if (!this.isEditMode) {
      this.loadFloors();
    }
  }

  // ==================== TASK DATA LOADING & EDITING ====================
  /** Load task details for edit mode */
  private loadTaskDetails(): void {
    if (!this.taskId) return;

    this.isLoading = true;
    this.taskService.getTaskById(this.taskId).subscribe({
      next: async (task) => {
        this.populateTaskModel(task);
        await this.loadLocationHierarchy();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading task details:', error);
        this.isLoading = false;
        this.showSnackbar('Failed to load task details', 3000, true);
      },
    });
  }

  /** Populate task model with data from API response */
  private populateTaskModel(data: any): void {
    // Helper function to format time (remove seconds if present)
    const formatTime = (timeString: string): string => {
      if (!timeString) return '00:00';
      const timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        return `${timeParts[0]}:${timeParts[1]}`;
      }
      return timeString;
    };

    this.taskModel = {
      ...this.taskModel,
      title: data.title || '',
      description: data.description || '',
      priority: data.priorityId || 0,
      status: data.statusId || 0,
      startDate: data.startDate || '',
      startTime: formatTime(data.startTime || ''),
      endDate: data.endDate || '',
      endTime: formatTime(data.endTime || ''),
      buildingId: undefined,
      floorId: data.floorId,
      pointId: data.pointId,
      sectionId: data.sectionId,
      userIds: data.users?.map((user: any) => user.id) || [],
    };

    this.Currently_reading = data.currentReading;
    this.processExistingFiles(data.files || []);
    this.setLocationSelections(data);
  }

  /** Process existing files from API response */
  private processExistingFiles(files: any[]): void {
    if (files && files.length > 0) {
      this.uploadedFiles = files.map((file: any) => ({
        id: file.id,
        name: file.name || file.path?.split('/').pop() || 'file',
        size: file.size || 0,
        type: this.getFileTypeFromPath(file.path || file.name),
        preview: file.path || '',
        path: file.path,
        isExisting: true,
      }));
    }
  }

  /** Set location selections based on task data */
  private setLocationSelections(data: any): void {
    this.selectedFloor = data.floorId;
    this.selectedSection = data.sectionId;
    this.selectedPoint = data.pointId;
    this.selectedShift = data.shiftId;
    this.selectedLevel = this.determineSelectedLevel();
  }

  /** Determine the selected level based on task data */
  private determineSelectedLevel(): string {
    if (this.taskModel.pointId) return 'Point';
    if (this.taskModel.sectionId) return 'Section';
    if (this.taskModel.floorId) return 'Floor';
    return '';
  }

  /** Load the complete location hierarchy for edit mode */
  private async loadLocationHierarchy(): Promise<void> {
    try {
      await this.loadFloorsAsync();

      if (this.selectedFloor) {
        await this.loadSectionsAsync(this.selectedFloor);
      }

      if (this.selectedSection) {
        await this.loadPointsAsync(this.selectedSection);
      }

      if (this.selectedPoint) {
        await this.loadShiftsByPointAsync(this.selectedPoint);
      }

      if (this.selectedPoint && this.selectedShift) {
        this.loadUsers();
      }

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading location hierarchy:', error);
      this.showSnackbar('Error loading location data', 3000, true);
    }
  }

  // ==================== ASYNC DATA LOADING METHODS ====================
  /** Load floors asynchronously */
  private loadFloorsAsync(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.filterBarService.loadFloorsPaged().subscribe({
        next: (floors) => {
          this.floors = floors;
          resolve();
        },
        error: (error) => {
          console.error('Error loading floors:', error);
          this.floors = [];
          reject(error);
        },
      });
    });
  }

  /** Load sections for a specific floor asynchronously */
  private loadSectionsAsync(floorId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.filterBarService.loadSectionsByFloor(floorId).subscribe({
        next: (sections) => {
          this.sections = sections;
          resolve();
        },
        error: (error) => {
          console.error('Error loading sections:', error);
          this.sections = [];
          reject(error);
        },
      });
    });
  }

  /** Load points for a specific section asynchronously */
  private loadPointsAsync(sectionId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.filterBarService.loadPointsBySection(sectionId).subscribe({
        next: (points) => {
          this.points = points.map((point) => ({
            ...point,
            isCountable: (point as any).isCountable || false,
          }));

          if (this.selectedPoint) {
            const selectedPoint = this.points.find(
              (p) => p.id === this.selectedPoint
            );
            this.isCountable = selectedPoint?.isCountable || false;
          }

          resolve();
        },
        error: (error) => {
          console.error('Error loading points:', error);
          this.points = [];
          reject(error);
        },
      });
    });
  }

  /** Load shifts for a specific point asynchronously */
  private loadShiftsByPointAsync(pointId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.shiftService
        .getPaginatedShifts({ pointId: pointId, pageNumber: 1 })
        .subscribe({
          next: (response) => {
            if (response?.succeeded && response.data) {
              this.shifts = response.data.data || [];
            } else {
              this.shifts = [];
            }
            resolve();
          },
          error: (error) => {
            console.error('Error loading shifts:', error);
            this.shifts = [];
            reject(error);
          },
        });
    });
  }

  // ==================== LOCATION HIERARCHY MANAGEMENT ====================
  /** Handle level change event */
  onLevelChange(): void {
    this.resetLocationSelections();
  }

  /** Reset location selections based on selected level */
  private resetLocationSelections(): void {
    const resetMap: { [key: string]: () => void } = {
      Floor: () => this.resetBelowFloor(),
      Section: () => this.resetBelowSection(),
    };
    resetMap[this.selectedLevel]?.();
  }

  /** Reset selections below floor level */
  private resetBelowFloor(): void {
    this.selectedFloor = null;
    this.floors = [];
    this.resetBelowSection();
  }

  /** Reset selections below section level */
  private resetBelowSection(): void {
    this.selectedSection = null;
    this.sections = [];
    this.selectedPoint = null;
    this.points = [];
    this.resetShiftsAndUsers();
  }

  /** Reset shifts and users selections */
  private resetShiftsAndUsers(): void {
    this.shifts = [];
    this.selectedShift = null;
    this.users = [];
    this.taskModel.userIds = [];
  }

  // ==================== LOCATION DROPDOWN EVENT HANDLERS ====================
  /** Handle floor change event */
  onFloorChange(): void {
    if (this.selectedFloor) {
      this.loadSections(this.selectedFloor);
      this.resetBelowSection();
      this.showSnackbar(
        'Floor selected. Now choose a section to filter available points.'
      );
    }
  }

  /** Handle section change event */
  onSectionChange(): void {
    if (this.selectedSection) {
      this.loadPoints(this.selectedSection);
      this.resetShiftsAndUsers();
      this.showSnackbar(
        'Section selected. Now choose the specific point where the task will be assigned.'
      );
    }
  }

  /** Handle point change event */
  onPointChange(event?: any): void {
    const pointId = event?.value || this.selectedPoint;
    this.selectedPoint = pointId;
    this.resetShiftsAndUsers();

    if (pointId) {
      const selectedPoint = this.points.find((p) => p.id === pointId);
      this.isCountable = selectedPoint?.isCountable || false;
      this.loadShiftsByPoint(pointId);
      this.showSnackbar(
        'Point selected! Now choose a shift for this point, then select users.'
      );
    }
  }

  /** Handle shift change event */
  onShiftChange(event?: any): void {
    const shiftId = event?.value || this.selectedShift;
    this.selectedShift = shiftId;

    if (shiftId && this.selectedPoint) {
      this.loadUsers();
      this.showSnackbar(
        'Shift selected! You can now assign users to this task.'
      );
    } else {
      this.users = [];
      this.taskModel.userIds = [];
    }
  }

  // ==================== SYNCHRONOUS DATA LOADING METHODS ====================
  /** Load floors from service */
  private loadFloors() {
    return this.filterBarService.loadFloorsPaged().subscribe({
      next: (floors) => {
        this.floors = floors;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading floors:', error);
        this.floors = [];
      },
    });
  }

  /** Load sections for a specific floor */
  private loadSections(floorId: number) {
    return this.filterBarService.loadSectionsByFloor(floorId).subscribe({
      next: (sections) => {
        this.sections = sections;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading sections:', error);
        this.sections = [];
      },
    });
  }

  /** Load points for a specific section */
  private loadPoints(sectionId: number) {
    return this.filterBarService.loadPointsBySection(sectionId).subscribe({
      next: (points) => {
        this.points = points.map((point) => ({
          ...point,
          isCountable: (point as any).isCountable || false,
        }));

        if (this.points.length === 0) {
          this.showSnackbar(
            'No points available in this section. Please select a different section.',
            4000
          );
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading points:', error);
        this.points = [];
      },
    });
  }

  /** Load shifts for a specific point */
  private loadShiftsByPoint(pointId: number) {
    return this.shiftService
      .getPaginatedShifts({ pointId: pointId, pageNumber: 1 })
      .subscribe({
        next: (response) => {
          if (response?.succeeded && response.data) {
            this.shifts = response.data.data || [];
            if (this.shifts.length === 0) {
              this.showSnackbar(
                'No shifts available for this point. Please contact administrator.',
                5000
              );
            }
          } else {
            this.shifts = [];
            this.showSnackbar('No shifts found for this point.', 4000);
          }
          this.selectedShift = null;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading shifts:', error);
          this.shifts = [];
          this.showSnackbar('Error loading shifts', 3000, true);
        },
      });
  }

  /** Load users based on selected point and shift */
  private loadUsers(): void {
    if (!this.selectedPoint || !this.selectedShift) {
      this.users = [];
      this.taskModel.userIds = [];
      return;
    }

    this.filterBarService
      .loadPaginatedUsers(
        1,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        this.selectedPoint,
        undefined,
        undefined,
        [this.selectedShift]
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.users = response.data.data.map((user: any) => ({
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
            }));

            if (this.users.length === 0) {
              this.showSnackbar(
                'No users available for this point and shift combination.',
                4000
              );
            }
          } else {
            this.users = [];
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.users = [];
          this.showSnackbar('Error loading users', 3000, true);
        },
      });
  }

  // ==================== FILE HANDLING METHODS ====================
  /** Handle file input change event */
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.processFiles(Array.from(input.files));
    }
  }

  /** Handle file drop event */
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  /** Handle drag over event */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  /** Process uploaded files */
  private processFiles(files: File[]): void {
    files.forEach((file) => {
      const fileObj: UploadedFile = {
        name: file.name,
        size: Math.round(file.size / 1024),
        type: file.type || this.getFileTypeFromExtension(file.name),
        preview: this.generateFilePreview(file),
        file: file,
        isExisting: false,
      };
      this.uploadedFiles.push(fileObj);
    });

    this.uploadSuccess = true;
    this.uploadError = false;
    this.cdr.detectChanges();
  }

  /** Remove a file from the uploaded files list */
  removeFile(index: number): void {
    const file = this.uploadedFiles[index];
    if (file.isExisting && file.id) {
      this.filesToDelete.push(file.id);
    }
    this.uploadedFiles.splice(index, 1);

    if (this.uploadedFiles.length === 0) {
      this.uploadSuccess = false;
      this.uploadError = false;
    }
  }

  // ==================== FILE UTILITY METHODS ====================
  /** Generate a preview for a file */
  private generateFilePreview(file: File): string {
    return file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : this.getFileIconPath(file.type);
  }

  /** Get file type from file path */
  private getFileTypeFromPath(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase() || '';
    const typeMap: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    return typeMap[extension] || 'application/octet-stream';
  }

  /** Get file type from file extension */
  private getFileTypeFromExtension(filename: string): string {
    return this.getFileTypeFromPath(filename);
  }

  /** Get icon path for a file type */
  private getFileIconPath(fileType: string): string {
    const iconMap: { [key: string]: string } = {
      'application/pdf': 'assets/icons/pdf-icon.svg',
      'application/msword': 'assets/icons/word-icon.svg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'assets/icons/word-icon.svg',
      'application/vnd.ms-excel': 'assets/icons/excel-icon.svg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'assets/icons/excel-icon.svg',
    };
    return iconMap[fileType] || 'assets/icons/file-icon.svg';
  }

  /** Get the Material icon name for a file type */
  getFileIcon(fileType: string): string {
    if (!fileType) return 'insert_drive_file';

    const iconMap: { [key: string]: string } = {
      'image/': 'image',
      'video/': 'videocam',
      'audio/': 'audiotrack',
      'application/pdf': 'picture_as_pdf',
      'application/msword': 'description',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'description',
      'application/vnd.ms-excel': 'table_chart',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'table_chart',
      'application/vnd.ms-powerpoint': 'slideshow',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        'slideshow',
      'application/zip': 'folder_zip',
      'application/x-rar-compressed': 'folder_zip',
    };

    return (
      Object.entries(iconMap).find(([key]) => fileType.includes(key))?.[1] ||
      'insert_drive_file'
    );
  }

  // ==================== FORM VALIDATION ====================
  /** Validate date and time inputs */
  validateDates(): void {
    if (
      this.taskModel.startDate &&
      this.taskModel.endDate &&
      this.taskModel.startTime &&
      this.taskModel.endTime
    ) {
      const startDateTime = new Date(
        `${this.taskModel.startDate}T${this.taskModel.startTime}`
      );
      const endDateTime = new Date(
        `${this.taskModel.endDate}T${this.taskModel.endTime}`
      );
      this.dateError = endDateTime <= startDateTime;
    } else {
      this.dateError = false;
    }
  }

  // ==================== FORM SUBMISSION ====================
  /** Handle form submission */
  submitTask(form?: any): void {
    if (this.isSubmitting) {
      return;
    }

    this.validateDates();
    if (this.dateError) {
      this.showSnackbar(
        'End date and time cannot be before start date and time',
        3000,
        true
      );
      return;
    }

    this.isSubmitting = true;
    this.prepareTaskModel();
    const formData = this.createFormData();

    this.isEditMode
      ? this.updateTask(formData)
      : this.createTask(formData, form);
  }

  /** Prepare the task model for submission */
  private prepareTaskModel(): void {
    this.taskModel.pointId = this.selectedPoint ?? undefined;
    this.taskModel.buildingId = undefined;
    this.taskModel.floorId = this.selectedFloor ?? undefined;
    this.taskModel.sectionId = this.selectedSection ?? undefined;
  }

  /** Create FormData object for submission */
  private createFormData(): FormData {
    const formData = new FormData();

    if (this.isEditMode && this.taskId) {
      formData.append('Id', this.taskId.toString());
    }

    if (this.selectedShift) {
      formData.append('ShiftId', this.selectedShift.toString());
    }

    // Add separate date and time fields
    if (this.taskModel.startDate) {
      formData.append('StartDate', this.taskModel.startDate);
    }

    if (this.taskModel.startTime) {
      formData.append('StartTime', this.taskModel.startTime + ':00');
    }

    if (this.taskModel.endDate) {
      formData.append('EndDate', this.taskModel.endDate);
    }

    if (this.taskModel.endTime) {
      formData.append('EndTime', this.taskModel.endTime + ':00');
    }

    // Add other task model fields
    Object.entries(this.taskModel).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        !['startDate', 'endDate', 'startTime', 'endTime', 'files'].includes(key)
      ) {
        const fieldName = this.isEditMode
          ? key.charAt(0).toUpperCase() + key.slice(1)
          : key;

        if (key === 'userIds' && Array.isArray(value)) {
          value.forEach((id) => formData.append('UserIds', id.toString()));
        } else {
          formData.append(fieldName, value.toString());
        }
      }
    });

    // Add current reading if applicable
    if (this.isCountable && this.Currently_reading != null) {
      formData.append('CurrentReading', this.Currently_reading.toString());
    }

    // Handle file operations
    this.filesToDelete.forEach((fileId) =>
      formData.append('DeletedFileId', fileId.toString())
    );
    this.uploadedFiles
      .filter((file) => !file.isExisting && file.file)
      .forEach((fileObj) =>
        formData.append(
          this.isEditMode ? 'Files' : 'files',
          fileObj.file!,
          fileObj.name
        )
      );

    return formData;
  }

  // ==================== TASK CREATION & UPDATE ====================
  /** Create a new task */
  private createTask(formData: FormData, form: any): void {
    this.taskService.createTask(formData).subscribe({
      next: () => this.handleSubmissionSuccess(form),
      error: (error) => {
        console.error('Create task error:', error);
        this.handleSubmissionError(error);
      },
    });
  }

  /** Update an existing task */
  private updateTask(formData: FormData): void {
    this.taskService.editTask(formData).subscribe({
      next: () => this.handleEditSuccess(),
      error: (error) => {
        console.error('Update task error:', error);
        this.handleUpdateError(error);
      },
    });
  }

  // ==================== SUCCESS & ERROR HANDLERS ====================
  /** Handle successful task creation */
  private handleSubmissionSuccess(form: any): void {
    this.isSubmitting = false;
    Swal.fire({
      title: 'Success!',
      text: 'Task added successfully!',
      icon: 'success',
      confirmButtonText: 'OK',
    }).then(() => {
      if (form) form.reset();
      this.uploadedFiles = [];
      this.navigateToTasks();
    });
  }

  /** Handle successful task update */
  private handleEditSuccess(): void {
    this.isSubmitting = false;
    this.cdr.detectChanges();

    Swal.fire({
      title: 'Success!',
      text: 'Task updated successfully!',
      icon: 'success',
      confirmButtonText: 'OK',
    }).then(() => {
      this.navigateToTasks();
    });
  }

  /** Handle task creation error with proper validation error display */
  private handleSubmissionError(error?: any): void {
    this.isSubmitting = false;

    let errorMessage = 'Error processing task. Please try again.';
    let errorTitle = 'Error!';

    // Check if it's a validation error (400 status with errors object)
    if (error && error.status === 400 && error.error && error.error.errors) {
      const validationErrors = error.error.errors;
      const errorMessages: string[] = [];

      // Extract all validation error messages
      Object.keys(validationErrors).forEach((field) => {
        const fieldErrors = validationErrors[field];
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach((errorMsg) => {
            errorMessages.push(`• ${errorMsg}`);
          });
        }
      });

      if (errorMessages.length > 0) {
        errorMessage = errorMessages.join('\n');
        errorTitle = 'Validation Error!';
      }
    } else if (error && error.error && error.error.message) {
      // Handle other types of error messages
      errorMessage = error.error.message;
    } else if (error && error.message) {
      errorMessage = error.message;
    }

    Swal.fire({
      title: errorTitle,
      html: errorMessage.replace(/\n/g, '<br>'),
      icon: 'error',
      confirmButtonText: 'Retry',
      customClass: {
        htmlContainer: 'text-left',
      },
    });
  }

  /** Handle task update error with proper validation error display */
  private handleUpdateError(error: any): void {
    this.isSubmitting = false;
    this.cdr.detectChanges();

    let errorMessage = 'Error updating task. Please try again.';
    let errorTitle = 'Error!';

    // Check if it's a validation error (400 status with errors object)
    if (error.status === 400 && error.error && error.error.errors) {
      const validationErrors = error.error.errors;
      const errorMessages: string[] = [];

      // Extract all validation error messages
      Object.keys(validationErrors).forEach((field) => {
        const fieldErrors = validationErrors[field];
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach((errorMsg) => {
            errorMessages.push(`• ${errorMsg}`);
          });
        }
      });

      if (errorMessages.length > 0) {
        errorMessage = errorMessages.join('\n');
        errorTitle = 'Validation Error!';
      }
    } else if (error.error && error.error.message) {
      // Handle other types of error messages
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    Swal.fire({
      title: errorTitle,
      html: errorMessage.replace(/\n/g, '<br>'),
      icon: 'error',
      confirmButtonText: 'Retry',
      customClass: {
        htmlContainer: 'text-left',
      },
    });
  }

  // ==================== UTILITY & HELPER METHODS ====================
  /** Show a snackbar notification */
  private showSnackbar(
    message: string,
    duration: number = 3000,
    isError: boolean = false
  ): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: isError ? ['error-snackbar'] : [],
    });
  }

  /** Get the user role path for navigation */
  getRolePath(): string {
    const userRole = getUserRole().toLowerCase();
    return userRole === 'admin' ? userRole : 'my-tasks';
  }

  /** Navigate to the tasks list page */
  navigateToTasks() {
    const userRole = getUserRole().toLowerCase();
    if (userRole === 'admin') {
      this.router.navigate([userRole + '/tasks']);
    } else {
      this.router.navigate([userRole + '/my-tasks']);
    }
  }

  // ==================== COMPUTED PROPERTIES ====================
  /** Get the page title based on mode */
  get pageTitle(): string {
    return this.isEditMode
      ? 'TASK-FORM.TITLES.EDIT_TASK'
      : 'TASK-FORM.TITLES.CREATE_TASK';
  }

  /** Get the submit button text based on mode and state */
  get submitButtonText(): string {
    if (this.isEditMode) {
      return this.isSubmitting
        ? 'TASK-FORM.BUTTONS.UPDATING'
        : 'TASK-FORM.BUTTONS.UPDATE_TASK';
    } else {
      return this.isSubmitting
        ? 'TASK-FORM.BUTTONS.CREATING'
        : 'TASK-FORM.BUTTONS.CREATE_TASK';
    }
  }
}
