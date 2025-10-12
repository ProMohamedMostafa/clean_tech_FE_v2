import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';

import {
  FeedbackDevice,
  SectionQuestionListResponse,
} from '../../models/feedback/feedback-device.model';
import { FeedbackDeviceRepository } from '../../repositories/feedback/feedback.repository';

@Injectable({
  providedIn: 'root',
})
export class FeedbackDeviceService {
  constructor(private feedbackDeviceRepo: FeedbackDeviceRepository) {}

  getFeedbackDevices(filters: {
    PageNumber?: number;
    PageSize?: number;
    Search?: string;
    SectionId?: number;
    Type?: number;
  }): Observable<any | null> {
    return this.feedbackDeviceRepo.getFeedbackDevices(filters).pipe(
      map((response) => {
        if (response.succeeded) {
          return response;
        }
        return null;
      })
    );
  }

  getFeedbackDeviceById(id: number): Observable<FeedbackDevice | null> {
    return this.feedbackDeviceRepo.getFeedbackDeviceById(id).pipe(
      map((response) => {
        if (response.succeeded && response.data) {
          return response.data;
        }
        return null;
      })
    );
  }

  createFeedbackDevice(payload: {
    name: string;
    sectionId: number;
    feedbackDeviceId: number;
    type: number;
  }): Observable<any | null> {
    return this.feedbackDeviceRepo.createFeedbackDevice(payload).pipe(
      map((response) => {
        if (response.succeeded) {
          return response;
        }
        console.error('Failed to create feedback device');
        return null;
      })
    );
  }

  updateFeedbackDevice(payload: {
    id: number;
    name: string;
    sectionId: number;
    feedbackDeviceId: number;
    type: number;
  }): Observable<any> {
    return this.feedbackDeviceRepo.updateFeedbackDevice(payload);
  }

  deleteFeedbackDevice(id: number): Observable<boolean> {
    return this.feedbackDeviceRepo
      .deleteFeedbackDevice(id)
      .pipe(map(() => true));
  }

  assignQuestions(payload: {
    sectionUsageId: number;
    questionIds: number[];
  }): Observable<boolean> {
    return this.feedbackDeviceRepo
      .assignQuestionsToSectionUsage(payload)
      .pipe(map(() => true));
  }

  getSectionQuestions(filters: {
    SectionId?: number;
    SectionUsageId?: number;
    PageNumber?: number;
    PageSize?: number;
    Search?: string;
    Type?: number;
  }): Observable<SectionQuestionListResponse | null> {
    return this.feedbackDeviceRepo.getSectionQuestions(filters).pipe(
      map((response) => {
        if (response.succeeded) {
          return response;
        }
        return null;
      })
    );
  }

  getHomeRate(month?: number): Observable<any> {
    return this.feedbackDeviceRepo.getHomeRate(month);
  }

  getDevicesCount(filters: {
    AreaId?: number;
    CityId?: number;
    OrganizationId?: number;
    BuildingId?: number;
    FloorId?: number;
  }): Observable<any> {
    return this.feedbackDeviceRepo.getDevicesCount(filters);
  }

  getTotalAnswers(): Observable<any> {
    return this.feedbackDeviceRepo.getTotalAnswers();
  }

  getAnswersCount(filters: {
    Year?: number;
    FeedbackDeviceId?: number;
  }): Observable<any> {
    return this.feedbackDeviceRepo.getAnswersCount(filters).pipe(
      map((response) => {
        if (response.succeeded) {
          return response.data; // يحتوي على labels و values
        }
        return null;
      })
    );
  }

  getHomeAudits(filters: {
    AreaId?: number;
    CityId?: number;
    OrganizationId?: number;
    BuildingId?: number;
    FloorId?: number;
  }): Observable<{ labels: string[]; values: number[] } | null> {
    return this.feedbackDeviceRepo.getHomeAudits(filters).pipe(
      map((response) => {
        if (response.succeeded && response.data) {
          return response.data; // contains { labels: [], values: [] }
        }
        return null;
      })
    );
  }

  getHomeStatistics(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
  }): Observable<any | null> {
    return this.feedbackDeviceRepo.getHomeStatistics(filters).pipe(
      map((response) => {
        if (response.succeeded && response.data) {
          return response.data;
          // يحتوي على { currentPage, totalPages, totalCount, data: [...] }
        }
        return null;
      })
    );
  }
}
