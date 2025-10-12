// src/app/validators/email.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value?.trim().toLowerCase(); // Trim and convert to lowercase
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email && !emailPattern.test(email)) {
      return { invalidEmail: 'Please enter a valid email address.' };
    }
    return null; // No error if validation passes
  };
}

