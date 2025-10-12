import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import {
  QuestionListResponse,
  QuestionResponse,
} from '../../models/feedback/question.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionsRepository {
  private readonly baseUrl = `${environment.apiUrl}/questions`;

  constructor(private http: HttpClient) {}

  // GET questions list with filters and pagination
  getQuestions(filters: {
    PageNumber?: number;
    PageSize?: number;
    Search?: string;
    type?: number; // Changed from 'type' to 'Type' to match API
    SectionId?: number;
    PointId?: number;
    SectionUsageId?: number;
    IsHidden?: boolean; // Added new filter
  }): Observable<QuestionListResponse> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        // Handle boolean values specifically
        if (typeof value === 'boolean') {
          params = params.set(key, value.toString());
        } else {
          params = params.set(key, value.toString());
        }
      }
    }
    return this.http.get<QuestionListResponse>(this.baseUrl, { params });
  }

  // GET single question by id
  getQuestionById(id: number): Observable<QuestionResponse> {
    return this.http.get<QuestionResponse>(`${this.baseUrl}/${id}`);
  }

  // POST create new question
  createQuestion(formData: FormData): Observable<QuestionResponse> {
    return this.http.post<QuestionResponse>(`${this.baseUrl}/create`, formData);
  }

  // PUT update existing question
  updateQuestion(formData: FormData): Observable<QuestionResponse> {
    return this.http.put<QuestionResponse>(`${this.baseUrl}/edit`, formData);
  }

  // DELETE multiple questions
  deleteQuestions(ids: number[]): Observable<any> {
    return this.http.delete(`${this.baseUrl}/forcedelete/ids`, {
      body: { ids },
    });
  }

  // POST assign question to section
  assignQuestionToSection(
    sectionIds: number[],
    questionIds: number[]
  ): Observable<any> {
    const url = `${environment.apiUrl}/section/question/create`;
    const body = {
      sectionIds,
      questionIds,
    };
    return this.http.post(url, body, {
      headers: {
        Accept: '*/*',
      },
    });
  }

  // POST assign questions to point
  assignQuestionsToPoint(
    pointId: number,
    questionIds: number[]
  ): Observable<any> {
    const url = `${this.baseUrl}/point`;
    const body = {
      pointId,
      questionIds,
    };
    return this.http.post(url, body, {
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    });
  }

  // DELETE remove questions from point
  removeQuestionsFromPoint(
    pointId: number,
    questionIds: number[]
  ): Observable<any> {
    const url = `${this.baseUrl}/point`;
    const body = {
      pointId,
      questionIds,
    };
    return this.http.delete(url, {
      body: body,
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    });
  }

    getQuestionsCount(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/home/count`);
  }
}
