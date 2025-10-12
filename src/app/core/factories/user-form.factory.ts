// src/app/core/factories/user-form.factory.ts
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { emailValidator } from '../helpers/email.validator';
import { textValidator } from '../helpers/text.validator';
import { passwordValidator } from '../helpers/password.validator';

export class UserFormFactory {
  static createForm(fb: FormBuilder, isEditMode: boolean): FormGroup {
    const commonTextValidators = [
      Validators.required,
      textValidator(),
      Validators.minLength(3),
      Validators.maxLength(255),
    ];

    const form = fb.group({
      userName: ['', commonTextValidators],
      firstName: ['', commonTextValidators],
      lastName: ['', commonTextValidators],
      email: ['', [Validators.required, emailValidator()]],
      phoneNumber: [
        '',
        [
          Validators.required,
          textValidator(),
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      password: [
        '',
        isEditMode
          ? [
              Validators.minLength(8),
              Validators.pattern(
                '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
              ),
            ]
          : [Validators.required, passwordValidator()],
      ],
      passwordConfirmation: [''],
      birthdate: [null, [Validators.required, this.futureDateValidator]],
      gender: [isEditMode ? '' : '0', Validators.required],
      idNumber: [
        '',
        [
          Validators.required,
          textValidator(),
          Validators.minLength(5),
          Validators.maxLength(20),
        ],
      ],
      nationalityName: ['', Validators.required],
      countryName: ['', Validators.required],
      roleId: [null, Validators.required],
      managerId: [null, [Validators.pattern('^[0-9]+$')]],
      providerId: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
      image: [null],
    });

    this.setupPasswordConfirmationValidator(form);
    return form;
  }

  private static setupPasswordConfirmationValidator(form: FormGroup): void {
    const passwordControl = form.get('password');
    const confirmPasswordControl = form.get('passwordConfirmation');

    if (passwordControl && confirmPasswordControl) {
      confirmPasswordControl.setValidators([
        (control: AbstractControl) => {
          const password = passwordControl.value;
          const confirmPassword = control.value;

          if (password && !confirmPassword) return { required: true };
          if (password && confirmPassword && password !== confirmPassword)
            return { mismatch: true };

          return null;
        },
      ]);

      passwordControl.valueChanges.subscribe(() => {
        confirmPasswordControl.updateValueAndValidity();
      });
    }
  }

  private static futureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const todayDate = new Date();
    return selectedDate > todayDate ? { futureDate: true } : null;
  }
}
