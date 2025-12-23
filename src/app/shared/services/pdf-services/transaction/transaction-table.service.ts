import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableStyleService } from '../general layout/table-style.service';
import { TransactionHistoryItem } from './transaction-report.model';

@Injectable({ providedIn: 'root' })
export class TransactionTableService {
  constructor(private tableStyle: TableStyleService) {}

  defaultHeaders = ['ID', 'Date', 'Type', 'Amount', 'Status', 'Description'];
  defaultColumnKeys = ['id', 'date', 'type', 'amount', 'status', 'description'];

  addTransactionTable(
    doc: jsPDF,
    config: any,
    data: TransactionHistoryItem[],
    startY: number,
    marginX: number,
    pageWidth: number
  ) {
    autoTable(doc, {
      startY,
      margin: { left: marginX, right: marginX },
      tableWidth: pageWidth - marginX * 2,
      head: [config.headers],
      body: this.prepareTableBody(data, config.columnKeys),
      styles: this.tableStyle.getDefaultStyles(),
      headStyles: this.tableStyle.getHeadStyles(),
      alternateRowStyles: this.tableStyle.getAlternateRowStyles(),
      columnStyles: this.tableStyle.getColumnStyles(),
    });
  }

  private prepareTableBody(
    data: TransactionHistoryItem[],
    columnKeys: string[]
  ): any[][] {
    return data.map((item) =>
      columnKeys.map((key) => (item as any)[key] ?? 'N/A')
    );
  }
}
