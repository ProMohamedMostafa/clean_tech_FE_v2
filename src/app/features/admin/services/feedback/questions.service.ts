import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { QuestionsRepository } from '../../repositories/feedback/questions.repository';
import {
  Question,
  QuestionListResponse,
} from '../../models/feedback/question.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  constructor(private questionsRepo: QuestionsRepository) {}

  // Get questions list with filters
  getQuestions(filters: {
    PageNumber?: number;
    PageSize?: number;
    Search?: string;
    type?: number;
    SectionId?: number;
    PointId?: number;
    SectionUsageId?: number;
    IsHidden?: boolean;
  }): Observable<QuestionListResponse | null> {
    return this.questionsRepo.getQuestions(filters).pipe(
      map((response) => {
        if (
          response.succeeded &&
          response.data?.data &&
          response.data.data.length > 0
        ) {
          // Filter out options with both text: null and image: null
          const filteredData = response.data.data.map((question) => ({
            ...question,
            choices:
              question.choices?.filter(
                (choice) => choice.text !== null || choice.image !== null
              ) || [],
          }));

          return {
            ...response,
            data: {
              ...response.data,
              data: filteredData,
            },
          };
        }
        return null;
      })
    );
  }

  // Get single question by id
  getQuestionById(id: number): Observable<Question | null> {
    return this.questionsRepo.getQuestionById(id).pipe(
      map((response) => {
        if (response.succeeded && response.data) {
          return response.data;
        }
        return null;
      })
    );
  }

  // Create new question
  createQuestion(formData: FormData): Observable<Question | null> {
    return this.questionsRepo.createQuestion(formData).pipe(
      map((response) => {
        if (response.succeeded && response.data) {
          return response.data;
        }
        console.error('Failed to create question');
        return null;
      })
    );
  }

  // Update existing question
  updateQuestion(formData: FormData): Observable<boolean> {
    return this.questionsRepo
      .updateQuestion(formData)
      .pipe(map((response) => response.succeeded));
  }

  // Delete multiple questions
  deleteQuestions(ids: number[]): Observable<boolean> {
    return this.questionsRepo.deleteQuestions(ids).pipe(map(() => true));
  }

  // Assign question to section
  assignQuestionToSection(
    sectionIds: number[],
    questionIds: number[]
  ): Observable<boolean> {
    return this.questionsRepo
      .assignQuestionToSection(sectionIds, questionIds)
      .pipe(map(() => true));
  }

  // Assign questions to point
  assignQuestionsToPoint(
    pointId: number,
    questionIds: number[]
  ): Observable<boolean> {
    return this.questionsRepo
      .assignQuestionsToPoint(pointId, questionIds)
      .pipe(map(() => true));
  }

  // Remove questions from point
  removeQuestionsFromPoint(
    pointId: number,
    questionIds: number[]
  ): Observable<boolean> {
    return this.questionsRepo
      .removeQuestionsFromPoint(pointId, questionIds)
      .pipe(map(() => true));
  }

  getQuestionsCount(): Observable<any> {
    return this.questionsRepo.getQuestionsCount();
  }
}
