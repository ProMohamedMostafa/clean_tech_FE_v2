import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableStyleService } from '../general layout/table-style.service';
import { AttendanceHistoryItem } from './attendance-report.model';

@Injectable({ providedIn: 'root' })
export class AttendanceTableService {
  constructor(private tableStyle: TableStyleService) {}

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
      startY,
      margin: { left: marginX, right: marginX },
      tableWidth: pageWidth - marginX * 2,
      head: [config.headers],
      body: this.prepareTableBody(data, config.columnKeys),
      styles: this.tableStyle.getDefaultStyles(),
      headStyles: this.tableStyle.getHeadStyles(),
      alternateRowStyles: this.tableStyle.getAlternateRowStyles(),
      columnStyles: this.tableStyle.getColumnStyles(),
      didDrawPage: () => {
        // optional page header/footer
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
