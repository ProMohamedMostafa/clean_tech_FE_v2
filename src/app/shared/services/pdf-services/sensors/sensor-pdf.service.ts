import { Injectable } from '@angular/core';
import { SensorReportConfig } from '../models/sensor-report.model';

@Injectable({ providedIn: 'root' })
export class SensorPdfService {
  prepareTable(config: SensorReportConfig): any[][] {
    return config.columnFormatter
      ? config.data.map(config.columnFormatter)
      : config.data.map((row) =>
          config.columnKeys!.map((k) =>
            k.split('.').reduce((o, i) => o?.[i], row)
          )
        );
  }
}
