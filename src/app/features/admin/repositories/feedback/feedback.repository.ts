import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import {
  FeedbackDeviceListResponse,
  FeedbackDeviceResponse,
  SectionQuestionListResponse,
} from '../../models/feedback/feedback-device.model';

@Injectable({
  providedIn: 'root',
})
export class FeedbackDeviceRepository {
  private readonly baseUrl = `${environment.apiUrl}/section/usage`;
  private readonly questionBaseUrl = `${environment.apiUrl}/section/question`;
  private readonly feedbackBaseUrl = `${environment.apiUrl}/feedback`;

  constructor(private http: HttpClient) {}

  getFeedbackDevices(filters: {
    PageNumber?: number;
    PageSize?: number;
    Search?: string;
    SectionId?: number;
    Type?: number;
  }): Observable<FeedbackDeviceListResponse> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }
    return this.http.get<FeedbackDeviceListResponse>(this.baseUrl, { params });
  }

  getFeedbackDeviceById(id: number): Observable<FeedbackDeviceResponse> {
    return this.http.get<FeedbackDeviceResponse>(`${this.baseUrl}/${id}`);
  }

  createFeedbackDevice(payload: {
    name: string;
    sectionId: number;
    feedbackDeviceId: number;
    type: number;
  }): Observable<FeedbackDeviceResponse> {
    return this.http.post<FeedbackDeviceResponse>(
      `${this.baseUrl}/create`,
      payload
    );
  }

  updateFeedbackDevice(payload: {
    id: number;
    name: string;
    sectionId: number;
    feedbackDeviceId: number;
    type: number;
  }): Observable<FeedbackDeviceResponse> {
    return this.http.put<FeedbackDeviceResponse>(
      `${this.baseUrl}/edit`,
      payload
    );
  }

  // 1️⃣ Delete section usage (already exists)
  deleteFeedbackDevice(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  // 2️⃣ Assign questions to section usage
  assignQuestionsToSectionUsage(payload: {
    sectionUsageId: number;
    questionIds: number[];
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/assign/questions`, payload);
  }

  // 3️⃣ Get all section questions
  getSectionQuestions(filters: {
    SectionId?: number;
    SectionUsageId?: number;
    PageNumber?: number;
    PageSize?: number;
    Search?: string;
    Type?: number;
  }): Observable<SectionQuestionListResponse> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }
    return this.http.get<SectionQuestionListResponse>(this.questionBaseUrl, {
      params,
    });
  }

  getHomeRate(month?: number): Observable<any> {
    let params = new HttpParams();
    if (month !== undefined) {
      params = params.set('Month', month.toString());
    }

    return this.http.get<any>(`${this.feedbackBaseUrl}/answers/home/rate`, {
      params,
    });
  }

  getDevicesCount(filters: {
    AreaId?: number;
    CityId?: number;
    OrganizationId?: number;
    BuildingId?: number;
    FloorId?: number;
  }): Observable<any> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined) {
        params = params.set(key, value.toString());
      }
    }
    return this.http.get<any>(`${this.feedbackBaseUrl}/devices/home/count`, {
      params,
    });
  }

  getTotalAnswers(): Observable<any> {
    return this.http.get<any>(`${this.feedbackBaseUrl}/answers/home/total`);
  }

  getAnswersCount(filters: {
    Year?: number;
    FeedbackDeviceId?: number;
  }): Observable<any> {
    let params = new HttpParams();
    if (filters.Year !== undefined) {
      params = params.set('Year', filters.Year.toString());
    }
    if (filters.FeedbackDeviceId !== undefined) {
      params = params.set(
        'FeedbackDeviceId',
        filters.FeedbackDeviceId.toString()
      );
    }

    return this.http.get<any>(`${this.feedbackBaseUrl}/answers/home/count`, {
      params,
    });
  }

  getHomeAudits(filters: {
    AreaId?: number;
    CityId?: number;
    OrganizationId?: number;
    BuildingId?: number;
    FloorId?: number;
  }): Observable<any> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined) {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<any>(`${this.feedbackBaseUrl}/answers/home/audits`, {
      params,
    });
  }

  getHomeStatistics(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
  }): Observable<any> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<any>(
      `${this.feedbackBaseUrl}/answers/home/statistics`,
      { params }
    );
  }
}
