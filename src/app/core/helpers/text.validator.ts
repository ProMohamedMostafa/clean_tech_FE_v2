// src/app/validators/text.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function textValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value && value.trim().length === 0) {
      return { textRequired: 'Text input cannot be empty.' };
    }
    return null; // No error if validation passes
  };
}
