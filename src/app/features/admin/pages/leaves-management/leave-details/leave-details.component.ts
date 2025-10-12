import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe, Location } from '@angular/common';
import Swal from 'sweetalert2'; // Import SweetAlert
import { LeaveService } from '../../../services/leave.service';
import {
  getUserId,
  getUserRole,
} from '../../../../../core/helpers/auth.helpers';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-leave-details',
  imports: [CommonModule, TranslateModule],
  providers: [DatePipe], // Add DatePipe here
  templateUrl: './leave-details.component.html',
  styleUrl: './leave-details.component.scss',
})
export class LeaveDetailsComponent {
  leave: any;
  userRole: string | null = getUserRole().toLowerCase();
  users: any[] = [];
  files: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private LeaveService: LeaveService,
    private router: Router,
    private location: Location, // inject Location

    private date: DatePipe // Inject DatePipe here
  ) {}

  ngOnInit(): void {
    this.getUserRoleFromLocalStorage();
    const leaveId = Number(this.route.snapshot.paramMap.get('id'));
    if (leaveId) {
      this.fetchleaveDetails(leaveId);
    }
    console.log(this.isCleaner);
  }
  navigateToEdit(leaveId: number): void {
    this.router.navigate([`manager/edit-leave/${leaveId}`]);
  }

  /**
   * Fetch the user's role from localStorage.
   */
  getUserRoleFromLocalStorage(): void {
    const userRole = getUserRole() || '';
  }

  get isCleaner(): boolean {
    return this.userRole === 'cleaner'; // adjust as needed
  }

  // Add this method to your LeaveDetailsComponent class
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'pending':
        return 'pending';
      default:
        return '';
    }
  }

  // Also add this method if you want to display formatted status text
  getStatusText(status: string): string {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  /**
   * Fetch leave details by ID.
   * @param leaveId - The ID of the leave.
   */
  fetchleaveDetails(leaveId: number): void {
    this.LeaveService.getLeaveById(leaveId).subscribe(
      (response) => {
        if (response.succeeded && response.data) {
          this.leave = response.data;
        } else {
          console.error('Failed to load leave details:', response.message);
          Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'You do not have access to this leave request.',
            confirmButtonText: 'Go Back',
          }).then(() => {
            this.location.back(); // Navigate back after alert closes
          });
        }
      },
      (error) => {
        console.error('Error fetching leave details:', error);
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'You do not have access to this leave request.',
          confirmButtonText: 'Go Back',
        }).then(() => {
          this.location.back(); // Navigate back after alert closes
        });
      }
    );
  }
  deleteleave(leaveId: number | undefined): void {
    if (!leaveId) {
      console.error('leave ID is not provided for deletion.');
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
        this.LeaveService.deleteLeave(leaveId).subscribe({
          next: (response) => {
            if (response.succeeded) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'The leave has been deleted successfully.',
              }).then(() => {
                this.location.back(); // 👈 Go back after success
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: `Failed to delete the leave: ${response.message}`,
              });
            }
          },
          error: (error) => {
            console.error('Error deleting leave:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'An error occurred while deleting the leave.',
            });
          },
        });
      }
    });
  }

  get isLeaveOwner(): boolean {
    const currentUserId = getUserId(); // get current userId
    return this.leave?.userId?.toString() === currentUserId;
  }

  get showApproveReject(): boolean {
    return !this.isLeaveOwner;
  }

  // Sample method to return class based on task type
  getTypeClass(type: string): string {
    switch (type) {
      case 'Sick':
        return 'sick-type';
      case 'Vacation':
        return 'vacation-type';
      case 'Emergency':
        return 'emergency-type';
      default:
        return 'default-type'; // Fallback for undefined types
    }
  }

  calculateDuration(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationInMs = endDate.getTime() - startDate.getTime();
    return Math.ceil(durationInMs / (1000 * 60 * 60 * 24)) + 1; // Include both start & end
  }

  get isManager(): boolean {
    return this.userRole === 'manager'; // or check roleId === '3' if you use numbers
  }

  approveLeave(leaveId: number): void {
    if (!leaveId) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to approve this leave request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, approve it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.LeaveService.approveLeave(leaveId).subscribe({
          next: (response) => {
            if (response.succeeded) {
              Swal.fire({
                icon: 'success',
                title: 'Approved!',
                text: 'The leave request has been approved.',
              }).then(() => {
                this.fetchleaveDetails(leaveId); // Refresh details after action
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: `Failed to approve leave: ${response.message}`,
              });
            }
          },
          error: (error) => {
            console.error('Error approving leave:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'An error occurred while approving the leave.',
            });
          },
        });
      }
    });
  }

  rejectLeave(leaveId: number): void {
    if (!leaveId) return;

    Swal.fire({
      title: 'Reject Leave',
      input: 'text',
      inputLabel: 'Reason for rejection',
      inputPlaceholder: 'Enter rejection reason',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Reject',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const rejectionReason = result.value;
        this.LeaveService.rejectLeave(leaveId, rejectionReason).subscribe({
          next: (response) => {
            if (response.succeeded) {
              Swal.fire({
                icon: 'success',
                title: 'Rejected!',
                text: 'The leave request has been rejected.',
              }).then(() => {
                this.fetchleaveDetails(leaveId); // Refresh details after action
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: `Failed to reject leave: ${response.message}`,
              });
            }
          },
          error: (error) => {
            console.error('Error rejecting leave:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'An error occurred while rejecting the leave.',
            });
          },
        });
      }
    });
  }
}
