// src/app/validators/password.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;
    if (password && (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))) {
      return { passwordStrength: 'Password must be at least 8 characters long, contain an uppercase letter and a number.' };
    }
    return null; // No error if validation passes
  };
}
