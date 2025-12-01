import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent implements OnInit, OnDestroy {
  @Input() task: any;
  @Input() currentRoute: string = '';

  @Output() viewTask = new EventEmitter<any>();
  @Output() editTask = new EventEmitter<any>();
  @Output() deleteTask = new EventEmitter<any>();
  @Output() archiveTask = new EventEmitter<any>();
  @Output() unarchiveTask = new EventEmitter<any>();

  isDropdownOpen = false;

  ngOnInit() {
    document.addEventListener('click', this.onOutsideClick);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onOutsideClick);
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  // Close dropdown if clicking outside
  private onOutsideClick = (event: any) => {
    if (!event.target.closest('.dropdown')) {
      this.isDropdownOpen = false;
    }
  };

  // Route checks
  isTasksRoute(): boolean {
    return this.currentRoute === 'tasks';
  }

  isMyTasksRoute(): boolean {
    return this.currentRoute === 'my-tasks';
  }

  isReceivedTasksRoute(): boolean {
    return this.currentRoute === 'received-tasks';
  }

  isTeamTasksRoute(): boolean {
    return this.currentRoute === 'team-tasks';
  }

  canEdit(): boolean {
    if (this.isTasksRoute() || this.isMyTasksRoute()) {
      return true;
    }
    return false;
  }

  canDelete(): boolean {
    if (this.isTasksRoute() || this.isMyTasksRoute()) {
      return true;
    }
    return false;
  }

  // Events
  onViewTask() {
    this.viewTask.emit(this.task);
  }

  onEditTask() {
    if (this.canEdit()) this.editTask.emit(this.task);
  }

  onDeleteTask() {
    if (this.canDelete()) this.deleteTask.emit(this.task);
  }

  onArchiveTask() {
    this.archiveTask.emit(this.task);
  }

  onUnarchiveTask() {
    this.unarchiveTask.emit(this.task);
  }

  formatTime(time: string | null | undefined): string {
  if (!time) return '';

  
  return time.slice(0, 5);
}




  // Helpers for styles
  getPriorityClass() {
    switch (this.task?.priority?.toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-default';
    }
  }

  getStatusClass(): string {
    switch (this.task?.status?.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'in progress':
        return 'status-in-progress';
      case 'pending':
        return 'status-pending';
      case 'not resolved':
        return 'status-not-resolved';
      case 'rejected':
        return 'status-rejected';
      case 'waiting for approve':
        return 'status-waiting-approve';
      default:
        return 'status-default';
    }
  }
  getTranslatedStatus(status: string | null | undefined): string {
    if (!status) return 'TASKS.NA';

    switch (status.toLowerCase()) {
      case 'completed':
        return 'TASKS.COMPLETED';
      case 'in progress':
        return 'TASKS.IN_PROGRESS';
      case 'pending':
        return 'TASKS.PENDING';
      case 'not resolved':
        return 'TASKS.NOT_RESOLVED';
      case 'rejected':
        return 'TASKS.REJECTED';
      case 'waiting for approval':
        return 'TASKS.WAITING_FOR_APPROVE';
      default:
        return 'TASKS.NA';
    }
  }
}
