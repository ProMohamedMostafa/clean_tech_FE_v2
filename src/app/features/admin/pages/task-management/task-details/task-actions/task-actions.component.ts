import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  getUserId,
  getUserRole,
} from '../../../../../../core/helpers/auth.helpers';

@Component({
  selector: 'task-actions',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './task-actions.component.html',
  styleUrls: ['./task-actions.component.scss'],
})
export class TaskActionsComponent implements OnInit {
  @Input() task: any;
  @Output() action = new EventEmitter<{ type: string; notes?: string }>();
  @Input() statusId: number | null = null;
  @Input() fromReceivedTasks: boolean = false;

  completionNotes = '';
  availableActions: string[] = [];
  showNotesModal = false;
  currentActionType = '';
  currentDir: 'ltr' | 'rtl' = 'ltr';

  readonly TASK_STATUS = {
    Pending: 0,
    InProgress: 1,
    WaitingForApproval: 2,
    Completed: 3,
    Rejected: 4,
    NotResolved: 5,
    Overdue: 6,
  } as const;

  private readonly actionsRequiringNotes = [
    'Complete',
    'Not Resolved',
    'Reject',
  ];

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'ar', 'ur']);
    this.translate.setDefaultLang('en');

    // detect direction based on lang
    this.translate.onLangChange.subscribe((event) => {
      this.currentDir =
        event.lang === 'ar' || event.lang === 'ur' ? 'rtl' : 'ltr';
    });
  }

  ngOnInit() {
    this.determineAvailableActions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['statusId'] || changes['task']) {
      this.determineAvailableActions();
    }
  }

  private determineAvailableActions(): void {
    this.availableActions = [];
    if (this.statusId === null) return;

    const userRole = getUserRole().toLowerCase();
    const userId = getUserId();
    const createdById = this.task?.createdBy;

    switch (this.statusId) {
      case this.TASK_STATUS.Pending:
        this.availableActions = ['Start', 'Delete'];
        break;
      case this.TASK_STATUS.InProgress:
        this.availableActions = ['Complete', 'Not Resolved'];
        break;
      case this.TASK_STATUS.WaitingForApproval:
        this.availableActions = ['Approve', 'Reject'];
        break;
      case this.TASK_STATUS.Rejected:
      case this.TASK_STATUS.NotResolved:
        this.availableActions = ['Restart', 'Delete'];
        break;
      case this.TASK_STATUS.Completed:
        this.availableActions = ['Delete'];
        break;
      case this.TASK_STATUS.Overdue:
        this.availableActions = ['Start', 'Complete', 'Not Resolved', 'Delete'];
        break;
      default:
        this.availableActions = [];
        break;
    }

    if (
      userRole === 'cleaner' ||
      (userId != createdById && userRole !== 'admin')
    ) {
      this.availableActions = this.availableActions.filter(
        (action) => action !== 'Delete'
      );
    }

    if (
      userRole === 'cleaner' ||
      (userId != createdById && userRole !== 'admin')
    ) {
      this.availableActions = this.availableActions.filter(
        (action) => action !== 'Approve' && action !== 'Reject'
      );
    }
  }

  getButtonClass(action: string): string {
    const buttonClasses: { [key: string]: string } = {
      Start: 'btn-start',
      Complete: 'btn-complete',
      'Not Resolved': 'btn-not-resolved',
      Approve: 'btn-approve',
      Reject: 'btn-reject',
      Delete: 'btn-delete',
      Restart: 'btn-restart',
    };
    return buttonClasses[action] || 'btn-default';
  }

  getButtonIcon(action: string): string {
    const iconClasses: { [key: string]: string } = {
      Start: 'fas fa-play',
      Complete: 'fas fa-check',
      'Not Resolved': 'fas fa-times',
      Approve: 'fas fa-thumbs-up',
      Reject: 'fas fa-thumbs-down',
      Delete: 'fas fa-trash',
      Restart: 'fas fa-redo',
    };
    return iconClasses[action] || 'fas fa-cog';
  }

  isDestructiveAction(action: string): boolean {
    return ['Delete', 'Reject'].includes(action);
  }

  requiresNotes(action: string): boolean {
    return this.actionsRequiringNotes.includes(action);
  }

  handleAction(type: string) {
    if (this.requiresNotes(type)) {
      this.currentActionType = type;
      this.showNotesModal = true;
      return;
    }
    this.action.emit({ type });
  }

  submitWithNotes() {
    this.action.emit({
      type: this.currentActionType,
      notes: this.completionNotes,
    });
    this.completionNotes = '';
    this.showNotesModal = false;
    this.currentActionType = '';
  }

  cancelNotes() {
    this.completionNotes = '';
    this.showNotesModal = false;
    this.currentActionType = '';
  }

  getStatusName(statusId: number): string {
    const statusNames: { [key: number]: string } = {
      0: this.translate.instant('TASK_STATUSES.PENDING'),
      1: this.translate.instant('TASK_STATUSES.IN_PROGRESS'),
      2: this.translate.instant('TASK_STATUSES.WAITING_FOR_APPROVAL'),
      3: this.translate.instant('TASK_STATUSES.COMPLETED'),
      4: this.translate.instant('TASK_STATUSES.REJECTED'),
      5: this.translate.instant('TASK_STATUSES.NOT_RESOLVED'),
      6: this.translate.instant('TASK_STATUSES.OVERDUE'),
    };
    return (
      statusNames[statusId] || this.translate.instant('TASK_STATUSES.UNKNOWN')
    );
  }
}
