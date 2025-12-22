import { Injectable } from "@angular/core";
import { TransactionReportConfig } from "../models/transaction-report.model";

@Injectable({ providedIn: 'root' })
export class TransactionPdfService {
  prepareTable(config: TransactionReportConfig): any[][] {
    return config.columnFormatter
      ? config.data.map(config.columnFormatter)
      : config.data.map(row =>
          config.columnKeys!.map(k => k.split('.').reduce((o, i) => o?.[i], row))
        );
  }
}
