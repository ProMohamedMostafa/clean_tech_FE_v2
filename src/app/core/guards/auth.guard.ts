// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      const allowedRoles = route.data['roles'] as string[];
      if (this.authService.hasRole(allowedRoles)) {
        return true;
      } else {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    } else {
      this.authService.logout();
      this.router.navigate(['/public/login']);
      return false;
    }
  }
}
