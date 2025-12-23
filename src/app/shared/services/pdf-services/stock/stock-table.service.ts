import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableStyleService } from '../general layout/table-style.service';
import { StockItem } from './stock-report.model';

@Injectable({ providedIn: 'root' })
export class StockTableService {
  constructor(private tableStyle: TableStyleService) {}

  defaultHeaders = ['Item', 'Category', 'Quantity', 'Unit', 'Status', 'Last Updated'];
  defaultColumnKeys = ['itemName', 'category', 'quantity', 'unit', 'status', 'lastUpdated'];

  addStockTable(
    doc: jsPDF,
    config: any,
    data: StockItem[],
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

  private prepareTableBody(data: StockItem[], columnKeys: string[]): any[][] {
    return data.map((item) => columnKeys.map((key) => (item as any)[key] ?? 'N/A'));
  }
}
