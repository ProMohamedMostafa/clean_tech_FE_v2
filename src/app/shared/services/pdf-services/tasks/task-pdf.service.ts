import { Injectable } from '@angular/core';
import { TaskReportConfig } from '../models/task-report.model';

@Injectable({ providedIn: 'root' })
export class TaskPdfService {
  prepareTable(config: TaskReportConfig): any[][] {
    if (!config.data || config.data.length === 0) {
      return [['No tasks available']];
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
