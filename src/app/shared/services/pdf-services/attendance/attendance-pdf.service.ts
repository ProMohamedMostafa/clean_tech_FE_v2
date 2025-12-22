import { Injectable } from '@angular/core';
import { AttendanceReportConfig } from '../models/attendance-report.model';

@Injectable({ providedIn: 'root' })
export class AttendancePdfService {
  prepareTable(config: AttendanceReportConfig): any[][] {
    if (!config.data?.length) {
      return [['No attendance data available']];
    }

    if (config.columnFormatter) {
      return config.data.map(config.columnFormatter);
    }

    if (config.columnKeys) {
      return config.data.map((row) =>
        config.columnKeys!.map(
          (key) => key.split('.').reduce((o, k) => o?.[k], row) ?? ''
        )
      );
    }

    return config.data.map(Object.values);
  }
}
