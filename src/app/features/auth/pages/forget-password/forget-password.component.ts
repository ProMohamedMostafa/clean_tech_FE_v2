import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { AppllyBtnComponent } from '../../components/applly-btn.component';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TranslateModule,
    AppllyBtnComponent,
  ],
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css'],
})
export class ForgetPasswordComponent {
  forgotPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // Inject AuthService
    private translate: TranslateService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }
  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email;

      this.authService.passwordForgot(email).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: this.translate.instant('forget.SUCCESS_TITLE'),
            text: this.translate.instant('forget.SUCCESS_MESSAGE'),
            confirmButtonColor: '#3085d6',
          });
          this.forgotPasswordForm.reset();
        },
        error: (err) => {
          const apiError = err?.error?.error || 'Unknown error occurred';

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: apiError,
            confirmButtonColor: '#d33',
          });
        },
      });
    }
  }
}
