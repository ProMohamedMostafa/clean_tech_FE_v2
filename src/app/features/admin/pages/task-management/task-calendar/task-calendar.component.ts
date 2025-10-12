// Angular Core & Common Modules
import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// Angular Calendar
import {
  CalendarModule,
  DateAdapter,
  CalendarDateFormatter,
  CalendarUtils,
  CalendarA11y,
  ɵCalendarA11yPipe,
  CalendarEventTitleFormatter,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

// RxJS & date-fns
import { Subject } from 'rxjs';
import {
  addWeeks,
  subWeeks,
  format,
  isToday,
  isSameWeek,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

// Shared
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../../../shared/services/task.service';
import { TaskModel } from '../../../../../shared/models/task.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { getUserRole } from '../../../../../core/helpers/auth.helpers';

@Component({
  selector: 'app-task-calendar',
  standalone: true,
  imports: [CalendarModule, CommonModule, TranslateModule],
  templateUrl: './task-calendar.component.html',
  styleUrls: ['./task-calendar.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useFactory: adapterFactory,
    },
    CalendarDateFormatter,
    CalendarUtils,
    CalendarA11y,
    ɵCalendarA11yPipe,
    CalendarEventTitleFormatter,
  ],
})
export class TaskCalendarComponent {
  viewDate: Date = new Date();
  view: 'week' = 'week'; // 👈 switched to week view
  events: any[] = [];
  refresh: Subject<any> = new Subject();
  colorPalette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B', '#FB5607'];
  locale: string = 'en';
  currentUserRole: string = '';
  isLoading: boolean = true;
  selectedDate: Date | null = null;

  constructor(
    private taskService: TaskService,
    private router: Router,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService
      .getTasks({
        PageNumber: 1,
        PageSize: 200,
      })
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            this.processTasks(response.data);
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private processTasks(tasks: TaskModel[]): void {
    this.events = tasks.map((task: TaskModel, index: number) => {
      const startDate = new Date(
        `${task.startDate}T${task.startTime || '00:00:00'}`
      );
      const endDate = task.endDate
        ? new Date(`${task.endDate}T${task.endTime || '23:59:59'}`)
        : new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour fallback if no end date

      // If you want to show the first assigned user in the title
      const assignedUser =
        task.users && task.users.length > 0
          ? ` - ${task.users[0].userName}`
          : '';

      return {
        start: startDate,
        end: endDate,
        title: `${task.title}${assignedUser}`, // ✅ visible title in calendar
        allDay: this.isAllDayTask(task),
        meta: task,
        color: {
          primary: this.colorPalette[index % this.colorPalette.length],
          secondary: this.getStatusColor(task.status),
        },
        cssClass: this.getTaskCssClass(task),
      };
    });

    this.refresh.next({});
  }

  private isAllDayTask(task: TaskModel): boolean {
    return !task.startTime && !task.endTime;
  }

  private getStatusColor(status: string): string {
    const statusMap: { [key: string]: string } = {
      Pending: '#FFF3CD',
      'In Progress': '#D1ECF1',
      Completed: '#D4EDDA',
      Overdue: '#F8D7DA',
      'Not Resolved': '#E2E3E5',
      WaitingForApproval: '#E6E6FA',
      Rejected: '#FFE4E1',
    };
    return statusMap[status] || '#E2E3E5';
  }

  private getTaskCssClass(task: TaskModel): string {
    const statusClassMap: { [key: string]: string } = {
      Pending: 'task-pending',
      'In Progress': 'task-in-progress',
      Completed: 'task-completed',
      Overdue: 'task-overdue',
      'Not Resolved': 'task-not-resolved',
      WaitingForApproval: 'task-waiting',
      Rejected: 'task-rejected',
    };
    return statusClassMap[task.status] || '';
  }

  previousWeek(): void {
    this.viewDate = subWeeks(this.viewDate, 1);
    this.loadTasks();
  }

  nextWeek(): void {
    this.viewDate = addWeeks(this.viewDate, 1);
    this.loadTasks();
  }

  goToToday(): void {
    this.viewDate = new Date();
    this.loadTasks();
  }

  getWeekRange(): string {
    const start = startOfWeek(this.viewDate, { weekStartsOn: 0 });
    const end = endOfWeek(this.viewDate, { weekStartsOn: 0 });
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  }

  onEventClicked(event: any): void {
    const task = event.meta;
    this.showTaskDetailsModal(task);
  }

  private showTaskDetailsModal(task: any): void {
    // Safely format assigned users with image and username
    const assignedUsers =
      task.users && task.users.length > 0
        ? task.users
            .map(
              (user: any) => `
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <img src="${user.image || 'assets/images/default-user.png'}"
                     alt="${user.userName}"
                     style="width:32px; height:32px; border-radius:50%; object-fit:cover; border:1px solid #ddd;">
                <span>${user.userName}</span>
              </div>
            `
            )
            .join('')
        : 'Not assigned';

    Swal.fire({
      title: task.title,
      html: `
      <div style="text-align:left; max-height:60vh; overflow-y:auto;">
        <p><strong>Status:</strong> 
          <span class="status-badge status-${task.status
            ?.toLowerCase()
            .replace(' ', '-')}">
            ${task.status}
          </span>
        </p>
        <p><strong>Priority:</strong> 
          <span class="priority-${task.priority?.toLowerCase()}">${
        task.priority
      }</span>
        </p>
        <p><strong>Start:</strong> ${new Date(
          task.startDate + 'T' + (task.startTime || '00:00:00')
        ).toLocaleString()}</p>
        ${
          task.endDate
            ? `<p><strong>End:</strong> ${new Date(
                task.endDate + 'T' + (task.endTime || '23:59:59')
              ).toLocaleString()}</p>`
            : ''
        }
        ${
          task.location
            ? `<p><strong>Location:</strong> ${task.location}</p>`
            : ''
        }
        ${
          task.buildingName
            ? `<p><strong>Building:</strong> ${task.buildingName}</p>`
            : ''
        }
        ${
          task.floorName
            ? `<p><strong>Floor:</strong> ${task.floorName}</p>`
            : ''
        }
        ${
          task.sectionName
            ? `<p><strong>Section:</strong> ${task.sectionName}</p>`
            : ''
        }

        <p><strong>Assigned to:</strong></p>
        <div>${assignedUsers}</div>

        <p style="margin-top:12px;"><strong>Description:</strong><br>
          ${task.description || 'No description'}
        </p>
      </div>
    `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#4ECDC4',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'View Details',
      cancelButtonText: 'Close',
      width: '700px',
      customClass: {
        popup: 'task-details-modal',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.navigateToTaskDetails(task.id);
      }
    });
  }

  navigateToTaskDetails(taskId: string): void {
    const baseRoute = this.getBaseRouteByRole();
    this.router.navigate([`/${baseRoute}/task-details`, taskId]);
  }

  private getBaseRouteByRole(): string {
    const roles: Record<string, string> = {
      Admin: 'admin',
      Manager: 'manager',
      Supervisor: 'supervisor',
      Cleaner: 'cleaner',
    };
    return roles[this.currentUserRole] || 'admin';
  }

  isCurrentWeek(date: Date): boolean {
    return isSameWeek(date, this.viewDate);
  }

  isDayToday(date: Date): boolean {
    return isToday(date);
  }
}
