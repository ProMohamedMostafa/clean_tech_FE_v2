import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableStyleService } from '../general layout/table-style.service';
import { SensorHistoryItem } from './sensor-report.model';
import { PdfLayoutService } from '../general layout/pdf-layout.service';

@Injectable({ providedIn: 'root' })
export class SensorTableService {
  constructor(
    private tableStyle: TableStyleService,
    private layout: PdfLayoutService
  ) {}

  defaultHeaders = [
    'Sensor ID',
    'Name',
    'Type',
    'Value',
    'Status',
    'Recorded At',
  ];
  defaultColumnKeys = ['id', 'name', 'type', 'value', 'status', 'recordedAt'];

  addSensorTable(
    doc: jsPDF,
    config: any,
    data: SensorHistoryItem[],
    startY: number,
    marginX: number,
    pageWidth: number
  ) {
    autoTable(doc, {
      // ✅ First page start
      startY,

      // ✅ Reserve header space on ALL pages
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

      // ✅ Redraw header after every page break
      didDrawPage: () => {
        this.layout.addHeader(doc, config.pdfTitle, pageWidth);
      },
    });
  }

  private prepareTableBody(
    data: SensorHistoryItem[],
    columnKeys: string[]
  ): any[][] {
    return data.map((item) =>
      columnKeys.map((key) => (item as any)[key] ?? 'N/A')
    );
  }
}
