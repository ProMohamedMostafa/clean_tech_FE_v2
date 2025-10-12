import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';

// Services
import { LeaveService } from '../../../services/leave.service';
import { UserService } from '../../../services/user.service';
import { getUserRole } from '../../../../../core/helpers/auth.helpers';

@Component({
  selector: 'app-leave-offcanvas',
  templateUrl: './leave-offcanvas.component.html',
  styleUrls: ['./leave-offcanvas.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
})
export class LeaveOffcanvasComponent {
  @Input() leaveEditData: any = null;
  @Input() users: any[] = [];
  @Input() isLeaveRequest: boolean = false;
  @Output() leaveUpdated = new EventEmitter<void>();

  isHovering: boolean = false;
  leaveData: any = {
    userLogin: this.getUserIdFromLocalStorage(),
    type: 0,
    startDate: '',
    endDate: '',
    reason: '',
    file: null,
  };

  constructor(
    private leaveService: LeaveService,
    private userManagementService: UserService
  ) {}

  /**
   * Check if the current document direction is RTL
   * @returns boolean - true if RTL, false if LTR
   */
  isRTL(): boolean {
    // Method 1: Check document direction
    const docDir = document.documentElement.dir || document.body.dir;
    if (docDir) {
      return docDir.toLowerCase() === 'rtl';
    }

    // Method 2: Check computed style (fallback)
    const computedDirection = window.getComputedStyle(
      document.documentElement
    ).direction;
    return computedDirection === 'rtl';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['leaveEditData']) {
      this.populateFormData();
    }

    if (
      changes['isLeaveRequest'] &&
      !this.isLeaveRequest &&
      !this.leaveData.userId
    ) {
      this.leaveData.userId = '';
    }
  }

  shouldShowUserDropdown(): boolean {
    return !this.isLeaveRequest;
  }

  populateFormData(): void {
    if (this.leaveEditData) {
      const typeMap: { [key: string]: number } = {
        Sick: 0,
        Annual: 1,
        Ordinary: 2,
      };

      const formData: any = {
        id: this.leaveEditData.id,
        type: typeMap[this.leaveEditData.type] || 0,
        startDate: this.leaveEditData.startDate,
        endDate: this.leaveEditData.endDate,
        reason: this.leaveEditData.reason,
        file: this.leaveEditData.file
          ? { name: this.leaveEditData.file.split('/').pop() }
          : null,
      };

      if (!this.isLeaveRequest && this.leaveEditData.userId) {
        formData.userId = this.leaveEditData.userId;
      }

      this.leaveData = formData;
    }
  }

  resetForm(): void {
    this.leaveEditData = null;
    this.leaveData = {
      userLogin: this.getUserIdFromLocalStorage(),
      type: 0,
      startDate: '',
      endDate: '',
      reason: '',
      file: null,
    };

    if (!this.isLeaveRequest) {
      this.leaveData.userId = '';
    }
  }

  updateLeave(): void {
    this.leaveData.type = +this.leaveData.type;

    if (this.isLeaveRequest) {
      const serviceCall = this.leaveData.id
        ? this.leaveService.editLeaveRequest(
            this.leaveData.id,
            this.leaveData.startDate || '',
            this.leaveData.endDate || '',
            this.leaveData.type,
            this.leaveData.reason || '',
            this.leaveData.file
          )
        : this.leaveService.createLeaveRequest(
            this.leaveData.startDate || '',
            this.leaveData.endDate || '',
            this.leaveData.type,
            this.leaveData.reason || '',
            this.leaveData.file
          );

      const successMessage = this.leaveData.id
        ? 'Leave request has been updated successfully.'
        : 'Leave request has been created successfully.';

      serviceCall.subscribe(() => {
        Swal.fire('Success!', successMessage, 'success');
        this.leaveUpdated.emit();
        if (!this.leaveData.id) this.resetForm();
      });
    } else {
      const formData = new FormData();

      if (this.leaveData.id) {
        formData.append('Id', this.leaveData.id.toString());
      }

      formData.append('userId', this.leaveData.userId?.toString() || '');
      formData.append('type', this.leaveData.type.toString());
      formData.append('startDate', this.leaveData.startDate || '');
      formData.append('endDate', this.leaveData.endDate || '');
      formData.append('reason', this.leaveData.reason || '');

      if (this.leaveData.file) {
        formData.append('file', this.leaveData.file);
      }

      const serviceCall = this.leaveData.id
        ? this.leaveService.editLeave(formData)
        : this.leaveService.createLeave(formData);

      const successMessage = this.leaveData.id
        ? 'Leave has been updated successfully.'
        : 'Leave has been created successfully.';

      serviceCall.subscribe(() => {
        Swal.fire('Success!', successMessage, 'success');
        this.leaveUpdated.emit();
        if (!this.leaveData.id) this.resetForm();
      });
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isHovering = true;
  }

  onDragLeave(): void {
    this.isHovering = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isHovering = false;
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.leaveData.file = files[0];
    }
  }

  triggerFileInput(): void {
    document.getElementById('fileUpload')?.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.leaveData.file = input.files[0];
    }
  }

  getUserIdFromLocalStorage(): void {
    const userRole = getUserRole() || '';
  }

  removeFile() {
    this.leaveData.file = null;
  }

  onOffcanvasHidden(): void {
    this.resetForm();
  }
}
