// notification.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AppNotification } from '../../models/notification';
import { NotificationService } from '../../../../core/services/notification.service';
import { SignalRService } from '../../../../core/services/signalr.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  imports: [CommonModule, NgbDropdownModule],
  standalone: true,
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() showUnreadOnly = true;
  @Output() notificationClicked = new EventEmitter<void>();

  notifications: AppNotification[] = [];
  isLoading = false;
  private notificationSub!: Subscription;
  private connectionStatusSub!: Subscription;

  constructor(
    private notificationService: NotificationService,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.setupSignalRConnection();
  }

  private setupSignalRConnection(): void {
    // Initialize SignalR connection
    this.signalRService.initializeConnections();

    // Subscribe to new notifications
    this.notificationSub = this.signalRService.notificationReceived.subscribe(
      (notification: AppNotification) => {
        this.handleNewNotification(notification);
      }
    );

    // Optional: Monitor connection status
    this.connectionStatusSub =
      this.signalRService.notificationConnectionStatus.subscribe(
        (status: string) => {
          console.log('Notification Hub Connection Status:', status);
          if (status === 'Connected') {
            // You might want to reload notifications when reconnected
            this.loadNotifications();
          }
        }
      );
  }

  private handleNewNotification(notification: AppNotification): void {
    console.log('📢 New notification received via SignalR:', notification); // 🛠️ ADD THIS LINE!

    // Add new notification to the beginning of the array
    this.notifications = [notification, ...this.notifications];

    // If showing only unread, make sure it's visible
    if (this.showUnreadOnly && notification.isRead) {
      this.notifications = this.notifications.filter((n) => !n.isRead);
    }
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotifications(this.showUnreadOnly).subscribe({
      next: (res) => {
        this.notifications = res.data?.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load notifications', err);
        this.notifications = [];
        this.isLoading = false;
      },
    });
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  toggleUnreadOnly(): void {
    this.showUnreadOnly = !this.showUnreadOnly;
    this.loadNotifications();
  }

  markAllAsRead(): void {
    this.notificationService.markAllNotificationsAsRead().subscribe({
      next: () => {
        // Update local state immediately instead of reloading
        this.notifications = this.notifications.map((n) => ({
          ...n,
          isRead: true,
        }));
      },
      error: (err) => console.error('Failed to mark all as read:', err),
    });
  }

  onNotificationClick(notification?: AppNotification): void {
    if (notification && !notification.isRead) {
    }
    this.notificationClicked.emit();
  }

  ngOnDestroy(): void {
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
    if (this.connectionStatusSub) {
      this.connectionStatusSub.unsubscribe();
    }
    // Note: We're not stopping the connection here as it might be used by other components
  }
}
