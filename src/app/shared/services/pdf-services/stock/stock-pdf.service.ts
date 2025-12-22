import { Injectable } from '@angular/core';
import { StockReportConfig } from '../models/stock-report.model';

@Injectable({ providedIn: 'root' })
export class StockPdfService {
  prepareTable(config: StockReportConfig): any[][] {
    return config.columnFormatter
      ? config.data.map(config.columnFormatter)
      : config.data.map((row) =>
          config.columnKeys!.map((k) =>
            k.split('.').reduce((o, i) => o?.[i], row)
          )
        );
  }
}
