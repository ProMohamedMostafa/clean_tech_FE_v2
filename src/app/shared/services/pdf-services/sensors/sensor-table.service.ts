import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableStyleService } from '../general layout/table-style.service';
import { SensorHistoryItem } from './sensor-report.model';

@Injectable({ providedIn: 'root' })
export class SensorTableService {
  constructor(private tableStyle: TableStyleService) {}

  defaultHeaders = ['Sensor ID', 'Name', 'Type', 'Value', 'Status', 'Recorded At'];
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

  private prepareTableBody(data: SensorHistoryItem[], columnKeys: string[]): any[][] {
    return data.map((item) => columnKeys.map((key) => (item as any)[key] ?? 'N/A'));
  }
}
