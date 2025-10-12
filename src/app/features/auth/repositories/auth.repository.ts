import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  ChangePasswordRequest,
  LoginData,
  LoginResponse,
  PasswordResetPayload,
  ProfileResponse,
  Role,
} from '../models/auth.model';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthRepository {
  // Base URL for authentication-related API endpoints
  private baseUrl = environment.apiUrl + '/auth';
  // Add a new baseUrl for authorization APIs (roles API)
  private authzBaseUrl = environment.apiUrl + '/v1/authorization';

  constructor(private http: HttpClient) {}

  /**
   * Sends login request to the API with user credentials.
   * @param data LoginData containing email/username and password
   * @returns Observable emitting LoginResponse with user info and token
   */
  login(data: LoginData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, data);
  }

  /**
   * Sends request to change the user's password.
   * PUT /auth/password/change
   * @param data ChangePasswordRequest containing current and new password details
   * @returns Observable emitting void on success
   */
  changePassword(data: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/password/change`, data);
  }

  /**
   * Fetches the profile details of the currently authenticated user.
   * GET /auth/profile
   * @returns Observable emitting ProfileResponse with user profile data
   */
  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.baseUrl}/profile`);
  }

  /**
   * Updates user profile with form data.
   * PUT /auth/profile/edit
   * @param formData FormData containing profile updates
   * @returns Observable emitting any response
   */
  editUserProfile(formData: FormData): Observable<any> {
    const url = `${this.baseUrl}/profile/edit`;

    return this.http.put<any>(url, formData);
  }

  /**
   * Logs out the current user by calling the logout endpoint.
   * GET /auth/logout
   * @returns Observable emitting any response from the logout endpoint
   */
  logout(): Observable<any> {
    return this.http.get(`${this.baseUrl}/logout`);
  }

  /**
   * Initiates password forgot process by sending user's email.
   * POST /auth/password-forgot
   * @param email User's email address
   * @returns Observable emitting any response from the server
   */
  passwordForgot(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/password-forgot`, { email });
  }

  /**
   * Resets the user's password using the reset token.
   * POST /auth/password-reset
   * @param payload PasswordResetPayload containing email, token, and new password info
   * @returns Observable emitting any response from the server
   */
  passwordReset(payload: PasswordResetPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/password-reset`, payload);
  }

  /**
   * Fetches all roles from the authorization API.
   * GET /v1/authorization/roles
   * @returns Observable emitting array of Role
   */
  getRoles(): Observable<Role[]> {
    return this.http
      .get<{
        statusCode: number;
        meta: any | null;
        succeeded: boolean;
        message: string;
        error: any | null;
        businessErrorCode: any | null;
        data: Role[];
      }>(`${this.authzBaseUrl}/roles`)
      .pipe(
        // Extract only the data array for easier usage downstream
        map((response) => response.data)
      );
  }
}
