import { Injectable } from '@angular/core';
import { FeedbackReportConfig } from '../models/feedback-report.model';

@Injectable({ providedIn: 'root' })
export class FeedbackPdfService {
  prepareTable(config: FeedbackReportConfig): any[][] {
    return config.columnFormatter
      ? config.data.map(config.columnFormatter)
      : config.data.map((row) =>
          config.columnKeys!.map((k) =>
            k.split('.').reduce((o, i) => o?.[i], row)
          )
        );
  }
}
