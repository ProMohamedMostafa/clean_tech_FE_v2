// sensor-report.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { PdfCoverService } from '../general layout/pdf-cover.service';
import { PdfLayoutService } from '../general layout/pdf-layout.service';
import { SensorChartService } from './sensor-chart.service';
import { SensorTableService } from './sensor-table.service';
import { SensorReportConfig } from '../models/sensor-report.model';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  SensorHistoryItem,
  SensorStatusData,
  SensorTypeData,
} from './sensor-report.model';

@Injectable({ providedIn: 'root' })
export class SensorReportService {
  private typeData: SensorTypeData = {
    temperature: 30,
    humidity: 20,
    pressure: 10,
  };
  private statusData: SensorStatusData = { active: 50, inactive: 8, error: 2 };

  constructor(
    private cover: PdfCoverService,
    private layout: PdfLayoutService,
    private chart: SensorChartService,
    private table: SensorTableService
  ) {}

  generateSensorPDF(config: SensorReportConfig): Observable<void> {
    const fullConfig = this.buildConfig(config);

    return this.fetchSensorData(fullConfig).pipe(
      map((data) => this.createPDF(fullConfig, data)),
      catchError((err) => {
        console.error('Error generating Sensor PDF', err);
        throw err;
      })
    );
  }

  private buildConfig(config: SensorReportConfig) {
    return {
      fileName: config.fileName || 'sensor_report',
      pdfTitle: config.pdfTitle || 'Sensor Report',
      includeCoverPage: config.includeCoverPage ?? true,
      reportInfo: config.reportInfo || {
        reportDate: new Date(),
        preparedBy: 'Sensor System',
      },
      headers: config.headers || this.table.defaultHeaders,
      columnKeys: config.columnKeys || this.table.defaultColumnKeys,
      data: config.data || [],
    };
  }

  private fetchSensorData(config: any): Observable<SensorHistoryItem[]> {
    return of(this.getMockData());
  }

  private getMockData(): SensorHistoryItem[] {
    return [
      {
        id: 'S001',
        name: 'Temp Sensor 1',
        type: 'Temperature',
        value: 25,
        status: 'Active',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S002',
        name: 'Humidity Sensor 1',
        type: 'Humidity',
        value: 60,
        status: 'Inactive',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S003',
        name: 'Pressure Sensor 1',
        type: 'Pressure',
        value: 1012,
        status: 'Error',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S001',
        name: 'Temp Sensor 1',
        type: 'Temperature',
        value: 25,
        status: 'Active',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S002',
        name: 'Humidity Sensor 1',
        type: 'Humidity',
        value: 60,
        status: 'Inactive',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S003',
        name: 'Pressure Sensor 1',
        type: 'Pressure',
        value: 1012,
        status: 'Error',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S001',
        name: 'Temp Sensor 1',
        type: 'Temperature',
        value: 25,
        status: 'Active',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S002',
        name: 'Humidity Sensor 1',
        type: 'Humidity',
        value: 60,
        status: 'Inactive',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S003',
        name: 'Pressure Sensor 1',
        type: 'Pressure',
        value: 1012,
        status: 'Error',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S001',
        name: 'Temp Sensor 1',
        type: 'Temperature',
        value: 25,
        status: 'Active',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S002',
        name: 'Humidity Sensor 1',
        type: 'Humidity',
        value: 60,
        status: 'Inactive',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S003',
        name: 'Pressure Sensor 1',
        type: 'Pressure',
        value: 1012,
        status: 'Error',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S001',
        name: 'Temp Sensor 1',
        type: 'Temperature',
        value: 25,
        status: 'Active',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S002',
        name: 'Humidity Sensor 1',
        type: 'Humidity',
        value: 60,
        status: 'Inactive',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S003',
        name: 'Pressure Sensor 1',
        type: 'Pressure',
        value: 1012,
        status: 'Error',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S001',
        name: 'Temp Sensor 1',
        type: 'Temperature',
        value: 25,
        status: 'Active',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S002',
        name: 'Humidity Sensor 1',
        type: 'Humidity',
        value: 60,
        status: 'Inactive',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S003',
        name: 'Pressure Sensor 1',
        type: 'Pressure',
        value: 1012,
        status: 'Error',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S001',
        name: 'Temp Sensor 1',
        type: 'Temperature',
        value: 25,
        status: 'Active',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S002',
        name: 'Humidity Sensor 1',
        type: 'Humidity',
        value: 60,
        status: 'Inactive',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S003',
        name: 'Pressure Sensor 1',
        type: 'Pressure',
        value: 1012,
        status: 'Error',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S001',
        name: 'Temp Sensor 1',
        type: 'Temperature',
        value: 25,
        status: 'Active',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S002',
        name: 'Humidity Sensor 1',
        type: 'Humidity',
        value: 60,
        status: 'Inactive',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S003',
        name: 'Pressure Sensor 1',
        type: 'Pressure',
        value: 1012,
        status: 'Error',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S001',
        name: 'Temp Sensor 1',
        type: 'Temperature',
        value: 25,
        status: 'Active',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S002',
        name: 'Humidity Sensor 1',
        type: 'Humidity',
        value: 60,
        status: 'Inactive',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S003',
        name: 'Pressure Sensor 1',
        type: 'Pressure',
        value: 1012,
        status: 'Error',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S001',
        name: 'Temp Sensor 1',
        type: 'Temperature',
        value: 25,
        status: 'Active',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S002',
        name: 'Humidity Sensor 1',
        type: 'Humidity',
        value: 60,
        status: 'Inactive',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S003',
        name: 'Pressure Sensor 1',
        type: 'Pressure',
        value: 1012,
        status: 'Error',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S001',
        name: 'Temp Sensor 1',
        type: 'Temperature',
        value: 25,
        status: 'Active',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S002',
        name: 'Humidity Sensor 1',
        type: 'Humidity',
        value: 60,
        status: 'Inactive',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S003',
        name: 'Pressure Sensor 1',
        type: 'Pressure',
        value: 1012,
        status: 'Error',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S001',
        name: 'Temp Sensor 1',
        type: 'Temperature',
        value: 25,
        status: 'Active',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S002',
        name: 'Humidity Sensor 1',
        type: 'Humidity',
        value: 60,
        status: 'Inactive',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S003',
        name: 'Pressure Sensor 1',
        type: 'Pressure',
        value: 1012,
        status: 'Error',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S001',
        name: 'Temp Sensor 1',
        type: 'Temperature',
        value: 25,
        status: 'Active',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S002',
        name: 'Humidity Sensor 1',
        type: 'Humidity',
        value: 60,
        status: 'Inactive',
        recordedAt: '2025-12-20',
      },
      {
        id: 'S003',
        name: 'Pressure Sensor 1',
        type: 'Pressure',
        value: 1012,
        status: 'Error',
        recordedAt: '2025-12-20',
      },
    ];
  }

  private createPDF(config: any, data: SensorHistoryItem[]): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 5;

    // ================= COVER =================
    if (config.includeCoverPage) {
      this.cover.addCover(
        doc,
        config,
        pageWidth,
        doc.internal.pageSize.getHeight()
      );
      doc.addPage();
    }

    // ================= CONTENT =================
    const fromDate = '01/12/2025'; // replace with dynamic start date if needed
    const toDate = '24/12/2025'; // replace with dynamic end date if needed

    const startY = this.layout.addHeader(
      doc,
      config.pdfTitle,
      pageWidth,
      fromDate,
      toDate
    );

    // Charts
    this.chart.addTypeChart(doc, 10, startY + 10, this.typeData);
    this.chart.addStatusChart(
      doc,
      pageWidth / 2 + 10,
      startY + 10,
      this.statusData
    );

    // Table
    const tableY = startY + 120;
    this.table.addSensorTable(doc, config, data, tableY, marginX, pageWidth);

    // Apply header & footer to all pages after cover
    this.layout.applyHeaderFooterToAllPages(
      doc,
      config.pdfTitle,
      pageWidth,
      fromDate,
      toDate
    );

    doc.save(`${config.fileName}.pdf`);
  }

  updateChartData(typeData?: SensorTypeData, statusData?: SensorStatusData) {
    if (typeData) this.typeData = typeData;
    if (statusData) this.statusData = statusData;
  }
}
