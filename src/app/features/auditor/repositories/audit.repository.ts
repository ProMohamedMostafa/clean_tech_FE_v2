import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuditAnswer, AuditHistoryResponse } from '../models/audit.model';

@Injectable({
  providedIn: 'root',
})
export class AuditRepository {
  private readonly baseUrl = `${environment.apiUrl}/audit/answers`;

  constructor(private http: HttpClient) {}

  getAuditAnswers(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    UserId?: number;
    SectionId?: number;
    FloorId?: number;
    BuildingId?: number;
  }): Observable<AuditHistoryResponse> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }
    return this.http.get<AuditHistoryResponse>(this.baseUrl, { params });
  }

  getAuditAnswerById(id: number): Observable<AuditAnswer> {
    return this.http.get<AuditAnswer>(`${this.baseUrl}/${id}`);
  }

  postAuditAnswers(payload: { sectionId: number; answers: AuditAnswer[] }): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }

   getAuditSum(year: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/audit/sum`, {
      params: new HttpParams().set('Year', year.toString()),
    });
  }

  getLocationsCount(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/locations/count`);
  }
}
