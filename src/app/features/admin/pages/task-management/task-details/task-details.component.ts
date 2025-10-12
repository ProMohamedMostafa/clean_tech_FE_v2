// task-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

// Components
import { TaskHeaderComponent } from './task-header/task-header.component';
import { TaskDescriptionComponent } from './task-description/task-description.component';
import { TaskFilesComponent } from './task-files/task-files.component';
import { TaskDetailsTableComponent } from './task-details-table/task-details-table.component';
import { TaskCommentsComponent } from './task-comments/task-comments.component';
import { TaskTeamComponent } from './task-team/task-team.component';
import { TaskActionsComponent } from './task-actions/task-actions.component';

// Services and Models
import { TaskService } from '../../../../../shared/services/task.service';
import { TaskModel } from '../../../../../shared/models/task.model';
import { getUserRole } from '../../../../../core/helpers/auth.helpers';

interface ExtendedTaskModel extends TaskModel {
  id: number;
  files?: any[];
  comments?: any[];
}

/**
 * TaskDetailsComponent
 * ---------------------
 * Handles viewing, updating, and managing task details.
 * Supports task actions (start, complete, reject, delete),
 * comment management, and route-aware rendering.
 */
@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatSnackBarModule,
    TaskHeaderComponent,
    TaskDescriptionComponent,
    TaskFilesComponent,
    TaskDetailsTableComponent,
    TaskCommentsComponent,
    TaskTeamComponent,
    TaskActionsComponent,
  ],
  providers: [DatePipe],
})
export class TaskDetailsComponent implements OnInit {
  // =====================
  // State variables
  // =====================
  task: ExtendedTaskModel | null = null;
  userId!: string;
  userImage: string | null = null;
  taskId: string = '';
  taskStatusId!: number;
  taskActionType: string | null = null;
  userRole = getUserRole().toLowerCase();
  currentRoute: string = '';

  // Status map for displaying readable task statuses
  private readonly statusMap: Record<number, string> = {
    0: 'Pending',
    1: 'In Progress',
    2: 'Waiting for Approval',
    3: 'Completed',
    4: 'Rejected',
    5: 'Not Resolved',
    6: 'Overdue',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private location: Location
  ) {
    this.taskActionType = this.route.snapshot.data['actionType'];
  }

  // =====================
  // Lifecycle
  // =====================
  ngOnInit(): void {
    this.setUserDataFromLocalStorage();

    // Capture navigation context
    this.route.queryParams.subscribe((params) => {
      this.currentRoute = params['fromRoute'] || 'tasks'; // Default to 'tasks'

      // Log for debugging
      console.log('📌 Query Params:', params);
      console.log('📌 fromRoute:', params['fromRoute']);
    });

    // Fetch task details
    const taskId = Number(this.route.snapshot.paramMap.get('id'));
    if (taskId) {
      this.fetchTaskDetails(taskId);
    }
  }

  // =====================
  // Route helpers
  // =====================
  isFromAdminTasks(): boolean {
    return this.currentRoute === 'tasks';
  }

  isFromMyTasks(): boolean {
    return this.currentRoute === 'my-tasks';
  }

  shouldShowEditButton(): boolean {
    // Do not allow if role is 'cleaner'
    if (this.userRole === 'cleaner') {
      return false;
    }

    // Otherwise, check existing conditions
    return this.isFromAdminTasks() || this.isFromMyTasks();
  }

  isFromReceivedTasks(): boolean {
    return this.currentRoute === 'received-tasks';
  }

  isFromTeamTasks(): boolean {
    return this.currentRoute === 'team-tasks';
  }

  // =====================
  // User helpers
  // =====================
  private setUserDataFromLocalStorage(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      this.userId = user?.id;
      this.userImage = user?.image || 'assets/user-avatar.png';
    } else {
      this.userImage = 'assets/user-avatar.png';
    }
  }

  isCurrentUserTaskCreator(): boolean {
    const userData = localStorage.getItem('userData');
    if (!userData) return false;

    const user = JSON.parse(userData);
    return this.task?.createdBy === user?.id;
  }

  // =====================
  // API Calls
  // =====================

  /** Fetch task details from API */
  private fetchTaskDetails(taskId: number): void {
    this.taskService.getTaskById(taskId).subscribe({
      next: (task: TaskModel) => {
        const processedComments = ((task as any).comments || []).map(
          (comment: any) => ({
            ...comment,
            userRole: comment.role || comment.userRole || 'Unknown',
          })
        );

        this.task = {
          ...task,
          files: (task as any).files || [],
          comments: processedComments, // Use processed comments
        };
        this.taskId = task.id?.toString();
        this.taskStatusId = task.statusId;
      },
    });
  }

  /** Update task status */
  private updateTaskStatus(
    taskId: number,
    statusId: number,
    comment: string,
    files: string[]
  ): void {
    this.taskService
      .updateTaskStatus(taskId, statusId, comment, files)
      .subscribe({
        next: () => {
          this.taskStatusId = statusId;
          if (this.task) this.task = { ...this.task, statusId };

          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Task status updated successfully.',
            timer: 2000,
            showConfirmButton: false,
          });

          this.fetchTaskDetails(taskId); // Refresh task
        },
      });
  }

  /** Delete task */
  deleteTask(taskId?: number): void {
    if (!taskId) return;

    Swal.fire({
      title: 'Confirm Deletion',
      text: 'This will permanently delete the task. Continue?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.taskService.deleteTask(taskId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Task has been deleted successfully.',
              timer: 2000,
              showConfirmButton: false,
            });
            // 👇 Navigate one step back instead of fixed route
            this.location.back();
          },
        });
      }
    });
  }

  // =====================
  // UI Actions
  // =====================

  /** Map numeric status to readable text */
  getStatusText(status: number | string): string {
    return typeof status === 'string'
      ? status
      : this.statusMap[status] || 'Unknown Status';
  }

  /** Handle action button clicks */
  handleAction(action: string): void {
    const actionMap: Record<string, number> = {
      Start: 1,
      Complete: 3,
      'Not Resolved': 5,
      Reject: 4,
    };

    const statusId = actionMap[action];
    const taskId = this.task?.id;

    if (action === 'Delete') {
      this.deleteTask(taskId);
      return;
    }

    if (taskId && statusId != null) {
      let comment = '';
      if (action === 'Not Resolved') comment = 'Marked as not resolved.';
      if (action === 'Reject') comment = 'Task rejected.';

      this.updateTaskStatus(taskId, statusId, comment, []);
    }
  }

  /** Handle comment submission */
  onCommentAdded(event: { comment: string; files: File[] }): void {
    const { comment, files } = event;
    const taskId = this.task?.id;
    if (!taskId) return;

    if (!comment.trim() && files.length === 0) {
      this.showSnackBar('Comment or file attachment is required', 'Dismiss');
      return;
    }

    this.taskService.createComment(taskId, comment, files).subscribe({
      next: () => {
        this.showSnackBar('Comment added successfully', 'Dismiss');
        this.fetchTaskDetails(taskId);
      },
    });
  }

  /** Handle task action events (from child component) */
  onTaskAction(event: { type: string; notes?: string }): void {
    const { type, notes } = event;
    const taskId = this.task?.id;
    if (!taskId) return;

    const actionMap: Record<string, number> = {
      Start: 1,
      Complete: 3,
      'Not Resolved': 5,
      Reject: 4,
      Approve: 3,
      Restart: 1,
      Reassign: 0,
    };

    const statusId = actionMap[type];

    if (statusId !== undefined) {
      let finalStatusId = statusId;
      let comment = notes || '';

      // Cleaner completing → Waiting for Approval
      if (type === 'Complete' && this.userRole === 'cleaner') {
        finalStatusId = 2;
        comment = comment || 'Task completed, awaiting approval';
      }

      this.updateTaskStatus(taskId, finalStatusId, comment, []);
    } else if (type === 'Delete') {
      this.deleteTask(taskId);
    } else if (type === 'Reassign') {
      this.handleReassignment(taskId);
    }
  }

  /** Placeholder for reassignment logic */
  private handleReassignment(taskId: number): void {
    // TODO: Implement reassignment (modal for user selection)
  }

  /** Navigate to edit task page */
  navigateToEdit(taskId: number | undefined): void {
    if (taskId != null) {
      this.router.navigate([this.userRole, 'edit-task', taskId.toString()]);
    }
  }

  // =====================
  // Helpers
  // =====================

  /** Show snackbar messages */
  private showSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['mat-toolbar', 'mat-primary'],
    });
  }
}
