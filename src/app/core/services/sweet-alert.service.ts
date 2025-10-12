// sweet-alert.service.ts
import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {
  showAlert(title: string, text: string, icon: SweetAlertIcon): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK'
    });
  }

  showError(title: string, text: string): Promise<SweetAlertResult<any>> {
    return this.showAlert(title, text, 'error');
  }

  showSuccess(title: string, text: string): Promise<SweetAlertResult<any>> {
    return this.showAlert(title, text, 'success');
  }

  showWarning(title: string, text: string): Promise<SweetAlertResult<any>> {
    return this.showAlert(title, text, 'warning');
  }

  showInfo(title: string, text: string): Promise<SweetAlertResult<any>> {
    return this.showAlert(title, text, 'info');
  }

  showConfirm(title: string, text: string, confirmButtonText: string = 'Yes', cancelButtonText: string = 'Cancel'): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText,
      cancelButtonText
    });
  }
}