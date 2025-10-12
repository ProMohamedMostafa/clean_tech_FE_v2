// src/app/core/services/feedback/answers.service.ts
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  AnswersRepository,
  AnswerListResponse,
  AnswerResponse,
  CreateAnswerPayload,
} from '../../repositories/feedback/answers.repository';

@Injectable({
  providedIn: 'root',
})
export class AnswersService {
  constructor(private answersRepo: AnswersRepository) {}

  getAnswers(filters: {
    PageNumber?: number;
    PageSize?: number;
    Search?: string;
    Date?: string | number;
    BuildingId?: number;
    FloorId?: number;
    SectionId?: number;
    FeedbackDeviceId?: number;
  }): Observable<AnswerListResponse | null> {
    return this.answersRepo
      .getAnswers(filters)
      .pipe(map((response) => response ?? null));
  }

  getAnswerById(id: number): Observable<any | null> {
    return this.answersRepo
      .getAnswerById(id)
      .pipe(map((response) => (response.succeeded ? response.data : null)));
  }

  createAnswer(
    payload: CreateAnswerPayload
  ): Observable<AnswerResponse | null> {
    return this.answersRepo
      .createAnswer(payload)
      .pipe(map((response) => response ?? null));
  }
}
