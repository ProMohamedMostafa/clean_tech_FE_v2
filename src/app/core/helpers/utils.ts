// utils.ts
import Swal from 'sweetalert2';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { UserModel } from '../../features/admin/models/user.model';

export function convertKeysToUpperCase(obj: any) {
  const upperCaseObj: any = {};
  Object.keys(obj).forEach((key) => {
    upperCaseObj[key.toUpperCase()] = obj[key];
  });
  return upperCaseObj;
}

export function showSuccessAlert(message: string, callback?: () => void) {
  Swal.fire({
    title: 'Success!',
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
  }).then(() => {
    if (callback) callback();
  });
}

export function showErrorAlert(message: string) {
  Swal.fire({
    title: 'Error',
    text: message,
    icon: 'error',
    confirmButtonText: 'OK',
  });
}

export function prepareFormData(user: UserModel): FormData {
  const formData = new FormData();
  const upperCaseUser = convertKeysToUpperCase(user);

  Object.keys(upperCaseUser).forEach((key) => {
    formData.append(key, upperCaseUser[key]);
  });

  return formData;
}

export function futureDateValidator(control: AbstractControl) {
  if (!control.value) return null;
  const selectedDate = new Date(control.value);
  const todayDate = new Date();
  return selectedDate > todayDate ? { futureDate: true } : null;
}

export function matchValues(matchTo: string): ValidatorFn {
  return (control: AbstractControl) => {
    const parent = control?.parent;
    if (!parent) return null;

    const matchingControl = parent.get(matchTo);
    if (!matchingControl) return null;

    return control.value === matchingControl.value ? null : { mismatch: true };
  };
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
