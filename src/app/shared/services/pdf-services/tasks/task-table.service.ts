import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableStyleService } from '../general layout/table-style.service';
import { TaskHistoryItem } from './task-report.model';

@Injectable({ providedIn: 'root' })
export class TaskTableService {
  constructor(private tableStyle: TableStyleService) {}

  defaultHeaders = [
    'Task Name',
    'Assigned To',
    'Priority',
    'Status',
    'Start Date',
    'End Date',
    'Description',
  ];

  defaultColumnKeys = [
    'taskName',
    'assignedTo',
    'priority',
    'status',
    'startDate',
    'endDate',
    'description',
  ];

  addTaskTable(
    doc: jsPDF,
    config: any,
    data: TaskHistoryItem[],
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
    data: TaskHistoryItem[],
    columnKeys: string[]
  ): any[][] {
    return data.map((item) =>
      columnKeys.map((key) => (item as any)[key] ?? 'N/A')
    );
  }
}
