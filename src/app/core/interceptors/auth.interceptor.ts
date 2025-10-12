import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private location: Location) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    const clonedReq = token
      ? req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        })
      : req;

    return next.handle(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          Swal.fire({
            icon: 'warning',
            title: 'Access Denied',
            text: 'You are not allowed to access this page.',
            confirmButtonText: 'Go Back',
          }).then(() => {
            // this.location.back();
          });
        }

        return throwError(() => error);
      })
    );
  }
}
