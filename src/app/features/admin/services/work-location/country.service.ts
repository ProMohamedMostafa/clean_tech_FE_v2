import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private apiUrl = environment.apiUrl; // Get base URL from environment

  constructor(private http: HttpClient) {}

  // Function to fetch the list of nationalities
  getNationalities(): Observable<any> {
    const url = `${this.apiUrl}/countries`;

    return this.http.get<any>(url);
  }
}
