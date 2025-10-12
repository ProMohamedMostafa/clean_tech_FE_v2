// notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}



  // ✅ Updated method with proper typing
  // In your service
  // In your service
  getNotifications(IsRead: boolean = false): Observable<any> {
    const url = `${this.baseUrl}/notifications?IsRead=${IsRead}`;
    return this.http.get<any>(url);
  }

  // ✅ New: Mark all notifications as read
  markAllNotificationsAsRead(): Observable<any> {
    const url = `${this.baseUrl}/notifications/mark/read`;
    return this.http.post<any>(
      url,
      {},
    
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>('your-unread-count-endpoint');
  }
}
