// error-handler.service.ts
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SweetAlertService } from './sweet-alert.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private errorMessageKeys: { [key: number]: string } = {
    1000: 'ERRORS.USERNAME_EXISTS',
    1001: 'ERRORS.EMAIL_EXISTS',
    1002: 'ERRORS.PASSWORD_RESET_REQUIRED',
    1003: 'ERRORS.NAME_EXISTS',
    1004: 'ERRORS.PHONE_EXISTS',
    1005: 'ERRORS.EMAIL_USERNAME_NOT_FOUND',
    1006: 'ERRORS.INCORRECT_PASSWORD',
    1007: 'ERRORS.ID_NUMBER_EXISTS',
    1008: 'ERRORS.NATIONALITY_NOT_EXISTS',
    1009: 'ERRORS.INVALID_DATE_RANGE',
    1010: 'ERRORS.COUNTRY_NOT_EXISTS',
    1011: 'ERRORS.MANAGER_NOT_EXISTS',
    1012: 'ERRORS.ROLE_NOT_EXISTS',
    1013: 'ERRORS.USER_CANNOT_MANAGE_SELF',
    1014: 'ERRORS.AREA_NOT_EXISTS',
    1015: 'ERRORS.CITY_NOT_EXISTS',
    1016: 'ERRORS.ORGANIZATION_NOT_EXISTS',
    1017: 'ERRORS.BUILDING_NOT_EXISTS',
    1018: 'ERRORS.FLOOR_NOT_EXISTS',
    1019: 'ERRORS.SECTION_NOT_EXISTS',
    1020: 'ERRORS.POINT_NOT_EXISTS',
    1021: 'ERRORS.USERS_NOT_FOUND',
    1022: 'ERRORS.SHIFTS_NOT_FOUND',
    1023: 'ERRORS.ORGANIZATIONS_NOT_FOUND',
    1024: 'ERRORS.BUILDINGS_NOT_FOUND',
    1025: 'ERRORS.FLOORS_NOT_FOUND',
    1026: 'ERRORS.SECTIONS_NOT_FOUND',
    1027: 'ERRORS.NOT_ASSIGNED_TO_TASK',
    1028: 'ERRORS.CATEGORY_NOT_EXISTS',
    1029: 'ERRORS.PROVIDER_NOT_EXISTS',
    1030: 'ERRORS.MATERIAL_NOT_EXISTS',
    1031: 'ERRORS.CURRENT_READING_REQUIRED',
    1032: 'ERRORS.AFTER_READING_REQUIRED',
    1033: 'ERRORS.CATEGORY_CANNOT_BE_PARENT',
    1034: 'ERRORS.TASK_CANNOT_BE_PARENT',
    1035: 'ERRORS.INVALID_OTP',
    1036: 'ERRORS.OTP_EXPIRED',
    1037: 'ERRORS.OPERATION_FAILED',
    1038: 'ERRORS.DEVICE_NOT_EXISTS',
    1039: 'ERRORS.DEVICE_ALREADY_ASSIGNED',
    1040: 'ERRORS.PARENT_TASK_NOT_EXISTS',
    1041: 'ERRORS.TASK_NOT_EXISTS',
    1042: 'ERRORS.READING_OUT_OF_RANGE',
    1043: 'ERRORS.TASK_ALREADY_COMPLETED',
    1044: 'ERRORS.SHIFT_NOT_EXISTS',
    1045: 'ERRORS.CANNOT_DELETE_ASSIGNED_SHIFT',
    1046: 'ERRORS.USER_NOT_EXISTS',
    1047: 'ERRORS.TAG_NOT_EXISTS',
    1048: 'ERRORS.LEAVE_NOT_EXISTS',
    1049: 'ERRORS.LEAVE_OVERLAPS',
    1050: 'ERRORS.SHIFT_OVERLAPS',
    1051: 'ERRORS.QUANTITY_EXCEEDS_AVAILABLE',
    1052: 'ERRORS.ASSIGNMENT_LIMIT_REACHED',
    1053: 'ERRORS.MIN_MAX_VALUE_NOT_EXISTS',
    1054: 'ERRORS.KEY_NOT_EXISTS',
    1055: 'ERRORS.LIMIT_NOT_EXISTS',
    1056: 'ERRORS.LEAVE_DATE_MUST_BE_FUTURE',
    1057: 'ERRORS.QUESTION_NOT_EXISTS',
    1058: 'ERRORS.CHOICE_NOT_EXISTS',
    1059: 'ERRORS.FEEDBACK_DEVICE_ALREADY_ASSIGNED',
    1060: 'ERRORS.FEEDBACK_DEVICE_NOT_EXISTS',
    1061: 'ERRORS.SECTION_USAGE_NOT_EXISTS',
    1062: 'ERRORS.ALREADY_ASSIGNED_TO_ENTITY',
    0: 'ERRORS.UNEXPECTED_ERROR',
  };

  constructor(
    private sweetAlert: SweetAlertService,
    private translate: TranslateService
  ) {}

  handleError(error: HttpErrorResponse): void {
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      this.translate
        .get(['ERRORS.CLIENT_ERROR_TITLE', 'ERRORS.CLIENT_ERROR_MESSAGE'])
        .subscribe((translations) => {
          this.sweetAlert.showError(
            translations['ERRORS.CLIENT_ERROR_TITLE'],
            translations['ERRORS.CLIENT_ERROR_MESSAGE']
          );
        });
    } else {
      // Server-side error
      const businessErrorCode = error.error.businessErrorCode;
      const message = error.error.message || 'Operation failed';

      if (businessErrorCode && this.errorMessageKeys[businessErrorCode]) {
        this.translate
          .get([
            'ERRORS.OPERATION_FAILED_TITLE',
            this.errorMessageKeys[businessErrorCode],
          ])
          .subscribe((translations) => {
            this.sweetAlert.showError(
              translations['ERRORS.OPERATION_FAILED_TITLE'],
              translations[this.errorMessageKeys[businessErrorCode]]
            );
          });
      } else {
        // Generic error message for unhandled codes or without businessErrorCode
        this.translate
          .get(['ERRORS.ERROR_TITLE', 'ERRORS.GENERIC_ERROR'])
          .subscribe((translations) => {
            this.sweetAlert.showError(
              translations['ERRORS.ERROR_TITLE'],
              error.error.error ||
                message ||
                translations['ERRORS.GENERIC_ERROR']
            );
          });
      }
    }
  }
}
