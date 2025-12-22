import { Injectable } from '@angular/core';
import { LeaveReportConfig } from '../models/leave-report.model';

@Injectable({ providedIn: 'root' })
export class LeavePdfService {
  prepareTable(config: LeaveReportConfig): any[][] {
    if (!config.data || config.data.length === 0) {
      return [['No leave records available']];
    }

    if (config.columnFormatter) {
      return config.data.map(config.columnFormatter);
    }

    if (config.columnKeys?.length) {
      return config.data.map(row =>
        config.columnKeys!.map(key =>
          key.split('.').reduce((o, k) => o?.[k], row) ?? ''
        )
      );
    }

    return config.data.map(Object.values);
  }
}
