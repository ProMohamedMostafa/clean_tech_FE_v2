import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { AppllyBtnComponent } from '../../components/applly-btn.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    AppllyBtnComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup = this.fb.group({
    USERNAME_OR_EMAIL: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;

    const loginData = {
      emailOrUserName: this.loginForm.value.USERNAME_OR_EMAIL?.trim(),
      password: this.loginForm.value.password?.trim(),
    };

    this.authService.login(loginData).subscribe((response) => {
      this.isLoading = false;

      if (response?.succeeded && response.data?.role) {
        this.redirectUserBasedOnRole(response.data.role);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.hasError('required')) {
      return this.translate.instant(
        `login.${controlName.toUpperCase()}_REQUIRED`
      );
    }
    return '';
  }

  private redirectUserBasedOnRole(role: string): void {
    const roleRoutes: { [key: string]: string } = {
      Admin: '/admin',
      Manager: '/manager',
      Supervisor: '/supervisor',
      Cleaner: '/cleaner',
      Auditor: '/auditor',
    };
    this.router.navigate([roleRoutes[role] || '/landing-page']);
  }
}
