// src/app/core/services/alert.service.ts
import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {
  success(message: string, callback?: () => void): void {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      confirmButtonColor: '#3f51b5',
    }).then(() => {
      if (callback) callback();
    });
  }

  error(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#3f51b5',
    });
  }

  validation(
    errors: Record<string, string[]>,
    title: string = 'Validation Error'
  ): void {
    const errorMessages = Object.entries(errors).map(([field, messages]) => {
      const formattedField = field
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());
      return `<b>${formattedField}:</b> ${messages.join(', ')}`;
    });

    Swal.fire({
      icon: 'error',
      title,
      html: `
        <div style="text-align: left;">
          <p>Please fix the following errors:</p>
          <ul style="padding-left: 20px;">
            ${errorMessages.map((msg) => `<li>${msg}</li>`).join('')}
          </ul>
        </div>
      `,
      confirmButtonColor: '#3085d6',
    });
  }

  formErrors(fields: string[], fieldNames: Record<string, string>): void {
    Swal.fire({
      icon: 'error',
      title: 'Form Error',
      html: `
        <div style="text-align: left;">
          <p>Please correct the following errors:</p>
          <ul>
            ${fields
              .map((key) => `<li>${fieldNames[key] || key} is invalid</li>`)
              .join('')}
          </ul>
        </div>
      `,
      confirmButtonColor: '#3f51b5',
    });
  }
}
