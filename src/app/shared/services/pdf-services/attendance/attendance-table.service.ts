import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableStyleService } from '../general layout/table-style.service';
import { AttendanceHistoryItem } from './attendance-report.model';
import { PdfLayoutService } from '../general layout/pdf-layout.service';

@Injectable({ providedIn: 'root' })
export class AttendanceTableService {
  constructor(
    private tableStyle: TableStyleService,
    private layout: PdfLayoutService
  ) {}

  defaultHeaders = [
    'User',
    'Role',
    'Date',
    'Clock In',
    'Clock Out',
    'Duration',
    'Status',
    'Shift Name',
  ];

  defaultColumnKeys = [
    'userName',
    'role',
    'date',
    'clockIn',
    'clockOut',
    'duration',
    'status',
    'shiftName',
  ];

  addAttendanceTable(
    doc: jsPDF,
    config: any,
    data: AttendanceHistoryItem[],
    startY: number,
    marginX: number,
    pageWidth: number
  ) {
    autoTable(doc, {
      // ✅ First page start position
      startY,

      // ✅ THIS IS THE MOST IMPORTANT FIX
      // Reserves space on EVERY page so table never touches header
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

      // ✅ Redraw header when autoTable creates a new page
      didDrawPage: () => {
        this.layout.addHeader(doc, config.pdfTitle, pageWidth);
      },
    });
  }

  private prepareTableBody(
    data: AttendanceHistoryItem[],
    columnKeys: string[]
  ): any[][] {
    return data.map((item) =>
      columnKeys.map((key) => (item as any)[key] ?? 'N/A')
    );
  }
}
