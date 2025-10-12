// src/app/core/repositories/feedback/answers.repository.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';

export interface Answer {
  questionId: number;
  type: number;
  answer: string;
}

export interface CreateAnswerPayload {
  feedbackDeviceId: number;
  answers: Answer[];
}

export interface AnswerResponse {
  succeeded: boolean;
  message: string;
  data: any;
}

export interface AnswerListResponse {
  succeeded: boolean;
  message: string;
  data: any[];
}

@Injectable({
  providedIn: 'root',
})
export class AnswersRepository {
  private readonly baseUrl = `${environment.apiUrl}/feedback/answers`;

  constructor(private http: HttpClient) {}

  // GET: list with filters
  getAnswers(filters: {
    PageNumber?: number;
    PageSize?: number;
    Search?: string;
    Date?: string | number;
    BuildingId?: number;
    FloorId?: number;
    SectionId?: number;
    FeedbackDeviceId?: number;
  }): Observable<AnswerListResponse> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }
    return this.http.get<AnswerListResponse>(this.baseUrl, { params });
  }

  // GET by id
  getAnswerById(id: number): Observable<AnswerResponse> {
    return this.http.get<AnswerResponse>(`${this.baseUrl}/${id}`);
  }

  // POST create
  createAnswer(payload: CreateAnswerPayload): Observable<AnswerResponse> {
    return this.http.post<AnswerResponse>(`${this.baseUrl}/create`, payload);
  }
}
