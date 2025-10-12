import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuditRepository } from '../repositories/audit.repository';
import { AuditHistoryResponse, AuditAnswer } from '../models/audit.model';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  constructor(private auditRepo: AuditRepository) {}

  getAuditAnswers(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    UserId?: number;
    SectionId?: number;
    FloorId?: number;
    BuildingId?: number;
  }): Observable<AuditHistoryResponse | null> {
    return this.auditRepo.getAuditAnswers(filters).pipe(
      map((response) => {
        if (
          response.succeeded &&
          response.data &&
          response.data.data.length > 0
        ) {
          return response;
        }
        return null;
      })
    );
  }

  getAuditAnswerById(id: number): Observable<AuditAnswer | null> {
    return this.auditRepo
      .getAuditAnswerById(id)
      .pipe(map((response) => response ?? null));
  }

  postAuditAnswers(payload: {
    sectionId: number;
    answers: AuditAnswer[];
  }): Observable<boolean> {
    return this.auditRepo.postAuditAnswers(payload).pipe(map(() => true));
  }

   getAuditSum(year: number): Observable<any | null> {
    return this.auditRepo.getAuditSum(year).pipe(
      map((response) => (response?.succeeded ? response.data : null))
    );
  }

  getLocationsCount(): Observable<any | null> {
    return this.auditRepo.getLocationsCount().pipe(
      map((response) => (response?.succeeded ? response.data : null))
    );
  }
}
