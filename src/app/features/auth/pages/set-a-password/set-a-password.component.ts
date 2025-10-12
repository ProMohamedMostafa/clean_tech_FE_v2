import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AppllyBtnComponent } from '../../components/applly-btn.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-set-a-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    AppllyBtnComponent,
  ],
  templateUrl: './set-a-password.component.html',
  styleUrls: ['./set-a-password.component.css'],
})
export class SetAPasswordComponent implements OnInit {
  setPasswordForm: FormGroup;
  email = '';
  token = '';
  successMessage = '';
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private authService: AuthService // Use AuthService here
  ) {
    this.setPasswordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.email = params.get('email') || '';
      const encodedToken = params.get('token') || '';
      this.token = decodeURIComponent(encodedToken);
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  get newPassword() {
    return this.setPasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.setPasswordForm.get('confirmPassword');
  }

  onSubmit() {
    if (this.setPasswordForm.valid) {
      this.loading = true;
      const payload = {
        email: this.email,
        token: this.token,
        newPassword: this.newPassword?.value,
        newPasswordConfirmation: this.confirmPassword?.value,
      };

      this.authService.passwordReset(payload).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: this.translate.instant('setPassword.SUCCESS_TITLE'),
            text: this.translate.instant('setPassword.SUCCESS_MESSAGE'),
            confirmButtonColor: '#3085d6',
          });
        },
        error: (err) => {
          this.loading = false;

          // ✅ Extract errors from validation or fallback
          const validationErrors = err?.error?.errors;
          let backendError = '';

          if (validationErrors) {
            // Flatten all validation messages
            const allMessages = Object.values(validationErrors)
              .flat()
              .join('\n');
            backendError = allMessages;
          } else {
            backendError =
              err?.error?.error ||
              err?.error?.message ||
              this.translate.instant('setPassword.DEFAULT_ERROR');
          }

          Swal.fire({
            icon: 'error',
            title: this.translate.instant('setPassword.ERROR_TITLE'),
            text: backendError,
            confirmButtonColor: '#d33',
          });
        },
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('setPassword.ERROR_TITLE'),
        text: this.translate.instant('setPassword.FORM_INVALID'),
        confirmButtonColor: '#d33',
      });
    }
  }
}
