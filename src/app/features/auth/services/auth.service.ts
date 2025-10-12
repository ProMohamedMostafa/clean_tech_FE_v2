import { Injectable } from '@angular/core';
import { tap, Observable, catchError, throwError } from 'rxjs';
import {
  ChangePasswordRequest,
  LoginData,
  LoginResponse,
  PasswordResetPayload,
  ProfileResponse,
  Role,
} from '../models/auth.model';
import { AuthRepository } from '../repositories/auth.repository';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private authRepo: AuthRepository, private router: Router) {}

  /**
   * Handles user login by calling the repository login method.
   * On success, saves token and user info locally.
   */
  login(data: LoginData): Observable<LoginResponse> {
    return this.authRepo.login(data).pipe(
      tap((response) => {
        if (response.succeeded && response.data) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data));
          localStorage.setItem('userId', response.data.id.toString()); // Store user ID
          localStorage.setItem(
            'location',
            response.data.location?.toString() ?? '' // empty string if null/undefined
          );
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error.error || { message: 'Unknown error' });
      })
    );
  }

  /**
   * Calls backend to change user's password.
   * @param data ChangePasswordRequest with current and new passwords
   * @returns Observable<void> completing on success
   */
  changePassword(data: ChangePasswordRequest): Observable<void> {
    return this.authRepo.changePassword(data).pipe(
      catchError((error) => {
        console.error('Change password error:', error);
        return throwError(() => error.error || { message: 'Unknown error' });
      })
    );
  }

  /**
   * Fetches the profile info of the currently logged-in user.
   * @returns Observable with profile response data
   */
  getProfile(): Observable<any> {
    return this.authRepo.getProfile().pipe(
      catchError((error) => {
        console.error('Get profile error:', error);
        return throwError(() => error.error || { message: 'Unknown error' });
      })
    );
  }

  /**
   * Updates user profile with form data.
   * @param formData FormData containing profile updates
   * @returns Observable<any> response from backend
   */
  editUserProfile(formData: FormData): Observable<any> {
    return this.authRepo.editUserProfile(formData).pipe(
      catchError((error) => {
        console.error('Edit profile error:', error);
        return throwError(() => error.error || { message: 'Unknown error' });
      })
    );
  }

  /**
   * Logs out the current user.
   * Calls backend logout endpoint and clears local storage.
   */
  logout(): void {
    // Call backend logout (optional: subscribe to handle errors or response)
    this.authRepo.logout().subscribe({
      next: () => {
        console.log('Logged out successfully from backend');
        this.router.navigate(['/public/login']);
      },
      error: (err) => {
        console.error('Logout backend error:', err);
        this.router.navigate(['/public/login']);
      },
    });

    // Clear local authentication data immediately
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Checks if user is logged in by verifying token existence.
   * @returns boolean true if logged in, false otherwise
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    // Optionally, verify token validity/expiration here
    return !!token;
  }

  /**
   * Checks if the logged-in user's role matches allowed roles.
   * @param allowedRoles string array of permitted roles
   * @returns boolean indicating access permission
   */
  hasRole(allowedRoles: string[]): boolean {
    if (!allowedRoles || allowedRoles.length === 0) return true;

    const userStr = localStorage.getItem('user');
    if (!userStr) return false;

    try {
      const user = JSON.parse(userStr);
      return allowedRoles.includes(user.role);
    } catch {
      return false;
    }
  }

  /**
   * Initiates the password reset process by sending the user's email.
   * @param email user's email address
   * @returns Observable<any> response from backend
   */
  passwordForgot(email: string): Observable<any> {
    return this.authRepo.passwordForgot(email).pipe(
      catchError((error) => {
        console.error('Password forgot error:', error);
        return throwError(() => error); // ⬅️ Don't strip the original error
      })
    );
  }

  /**
   * Completes the password reset using token and new password data.
   * @param payload PasswordResetPayload containing email, token, and new password info
   * @returns Observable<any> response from backend
   */
  passwordReset(payload: PasswordResetPayload): Observable<any> {
    return this.authRepo.passwordReset(payload).pipe(
      catchError((error) => {
        console.error('Password reset error:', error);
        return throwError(() => error); // ✅ full error passed
      })
    );
  }

  getProfileRoute(userRole: string): string {
    const routes: Record<string, string> = {
      Admin: 'admin/profile',
      Manager: 'manager/profile',
      Supervisor: 'supervisor/profile',
      Cleaner: 'cleaner/profile',
      Auditor: 'auditor/profile',
    };
    return routes[userRole] || 'login';
  }
}
