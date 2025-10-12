import { Injectable, EventEmitter } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { getToken } from '../helpers/auth.helpers';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private baseHubUrl = environment.apiUrl.replace('/api/v1', '');
  private notificationHubConnection!: signalR.HubConnection;
  commentHubConnection!: signalR.HubConnection;

  public notificationConnectionStatus = new EventEmitter<string>();
  public commentConnectionStatus = new EventEmitter<string>();
  public notificationReceived = new EventEmitter<any>();

  constructor() {}

  // 👉 Initialize all SignalR connections
  initializeConnections() {
    console.log('🚀 Initializing SignalR connections...');
    this.startNotificationHubConnection();
    // this.startCommentHubConnection();
  }

  // 👉 Start Notification Hub with detailed logs
  private startNotificationHubConnection() {
    const token = getToken();
    if (!token) {
      console.error('❌ Cannot start Notification Hub: token missing');
      this.notificationConnectionStatus.emit('Failed');
      return;
    }

    const hubUrl = `${this.baseHubUrl}/notificationHub`;
    console.log('Connecting to Notification Hub at:', hubUrl);

    this.notificationHubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          console.log('SignalR requested token, sending:', token);
          return token;
        },
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Debug) // More detailed SignalR logs
      .build();

    this.notificationHubConnection
      .start()
      .then(() => {
        console.log('✅ Notification Hub Connected!');
        this.notificationConnectionStatus.emit('Connected');
        this.setupNotificationListeners();
      })
      .catch((err) => {
        console.error('❌ Notification Hub Connection Error:', err);
        if (err && err.statusCode === 401) {
          console.error('❌ Unauthorized: Token may be invalid or expired');
        }
        this.notificationConnectionStatus.emit('Failed');
      });

    // Listen for connection lifecycle events
    this.notificationHubConnection.onreconnecting((error) => {
      console.warn('⚠️ Notification Hub reconnecting...', error);
      this.notificationConnectionStatus.emit('Reconnecting');
    });

    this.notificationHubConnection.onreconnected((connectionId) => {
      console.log(
        '🔄 Notification Hub reconnected. ConnectionId:',
        connectionId
      );
      this.notificationConnectionStatus.emit('Connected');
    });

    this.notificationHubConnection.onclose((error) => {
      console.error('🔴 Notification Hub disconnected', error);
      this.notificationConnectionStatus.emit('Disconnected');
    });
  }

  // 👉 Listen for notifications
  private setupNotificationListeners() {
    this.notificationHubConnection.on(
      'ReceiveNotification',
      (notification: any) => {
        console.log('📩 Notification received:', notification);
        this.notificationReceived.emit(notification);
      }
    );
  }

  // 👉 Check connection status
  isNotificationHubConnected(): boolean {
    const state = this.notificationHubConnection?.state;
    console.log('Notification Hub state:', state);
    return state === signalR.HubConnectionState.Connected;
  }

  // 👉 Task group methods
  public joinTaskGroup(taskId: string): Promise<void> {
    if (
      this.commentHubConnection?.state === signalR.HubConnectionState.Connected
    ) {
      return this.commentHubConnection
        .invoke('JoinTaskGroup', taskId)
        .then(() => console.log(`✅ Joined task group: ${taskId}`))
        .catch((error) => {
          console.error(`❌ Failed to join task group ${taskId}:`, error);
          throw error;
        });
    }
    const errorMsg = '❌ Comment hub not connected. Cannot join task group.';
    console.error(errorMsg);
    return Promise.reject(errorMsg);
  }

  public leaveTaskGroup(taskId: string): Promise<void> {
    if (
      this.commentHubConnection?.state === signalR.HubConnectionState.Connected
    ) {
      return this.commentHubConnection.invoke('LeaveTaskGroup', taskId);
    }
    return Promise.reject('Comment hub not connected');
  }

  // 👉 Stop connections
  stopAllConnections() {
    if (this.notificationHubConnection) {
      this.notificationHubConnection
        .stop()
        .then(() => console.log('🔴 Notification Hub Disconnected'))
        .catch((err) =>
          console.error('❌ Error stopping Notification Hub:', err)
        );
    }
    if (this.commentHubConnection) {
      this.commentHubConnection
        .stop()
        .then(() => console.log('🔴 Comment Hub Disconnected'))
        .catch((err) => console.error('❌ Error stopping Comment Hub:', err));
    }
  }
}
