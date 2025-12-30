import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableStyleService } from '../general layout/table-style.service';
import { PdfLayoutService } from '../general layout/pdf-layout.service';

@Injectable({ providedIn: 'root' })
export class StockTableService {
  constructor(
    private tableStyle: TableStyleService,
    private layout: PdfLayoutService
  ) {}

  defaultHeaders = [
    'Item Name',
    'Category',
    'User',
    'Date',
    'Provider',
    'Quantity',
    'Price',
    'Total',
    'Has File',
  ];

  defaultColumnKeys = [
    'name',
    'category',
    'userName',
    'createdAt',
    'provider',
    'quantity',
    'price',
    'totalPrice',
    'hasFile',
  ];

  addStockTable(
    doc: jsPDF,
    config: any,
    data: any[],
    startY: number,
    marginX: number,
    pageWidth: number
  ) {
    autoTable(doc, {
      startY,
      margin: {
        top: this.layout.HEADER_HEIGHT + 10,
        left: marginX,
        right: marginX,
        bottom: 15,
      },
      tableWidth: pageWidth - marginX * 2,
      head: [config.headers],
      body: this.prepareTableBody(data, config.columnKeys),
      styles: this.tableStyle.getDefaultStyles(),
      headStyles: this.tableStyle.getHeadStyles(),
      alternateRowStyles: this.tableStyle.getAlternateRowStyles(),
      columnStyles: this.tableStyle.getColumnStyles(),
      didDrawPage: () => {
        this.layout.addHeader(doc, config.pdfTitle, pageWidth);
      },
    });
  }

  private prepareTableBody(data: any[], columnKeys: string[]): any[][] {
    return data.map((item) =>
      columnKeys.map((key) => (item as any)[key] ?? 'N/A')
    );
  }
}
