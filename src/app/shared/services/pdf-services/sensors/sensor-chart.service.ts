import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { SensorStatusData, SensorTypeData } from './sensor-report.model';

@Injectable({ providedIn: 'root' })
export class SensorChartService {
  private chartColors = {
    type: {
      temperature: [244, 67, 54],
      humidity: [33, 150, 243],
      pressure: [76, 175, 80],
    },
    status: {
      active: [76, 175, 80],
      inactive: [158, 158, 158],
      error: [244, 67, 54],
    },
  };

  addTypeChart(doc: jsPDF, x: number, y: number, data: SensorTypeData) {
    const chartData = [
      { label: 'Temperature', value: data.temperature, color: this.chartColors.type.temperature },
      { label: 'Humidity', value: data.humidity, color: this.chartColors.type.humidity },
      { label: 'Pressure', value: data.pressure, color: this.chartColors.type.pressure },
    ];
    this.drawChartWithLegend(doc, x, y, 25, chartData, 'Sensor Type Distribution');
  }

  addStatusChart(doc: jsPDF, x: number, y: number, data: SensorStatusData) {
    const chartData = [
      { label: 'Active', value: data.active, color: this.chartColors.status.active },
      { label: 'Inactive', value: data.inactive, color: this.chartColors.status.inactive },
      { label: 'Error', value: data.error, color: this.chartColors.status.error },
    ];
    this.drawChartWithLegend(doc, x, y, 25, chartData, 'Sensor Status Distribution');
  }

  private drawChartWithLegend(
    doc: jsPDF,
    x: number,
    y: number,
    radius: number,
    data: { label: string; value: number; color: number[] }[],
    title: string
  ) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(title, x, y);

    const centerX = x + radius + 3;
    const centerY = y + radius + 10;

    this.drawPieChart(doc, centerX, centerY, radius, data);

    const legendX = centerX + radius + 10;
    const legendY = centerY - (data.length * 7) / 2;
    this.drawLegend(doc, legendX, legendY, data);
  }

  private drawPieChart(
    doc: jsPDF,
    centerX: number,
    centerY: number,
    radius: number,
    data: { label: string; value: number; color: number[] }[]
  ) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      doc.setFillColor(240, 240, 240);
      doc.circle(centerX, centerY, radius, 'F');
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text('No Data', centerX, centerY, { align: 'center' });
      return;
    }

    let startAngle = -90;
    data.forEach((item) => {
      if (item.value === 0) return;
      const sliceAngle = (item.value / total) * 360;
      const steps = Math.max(50, Math.ceil(sliceAngle));
      const angleStep = sliceAngle / steps;

      for (let i = 0; i < steps; i++) {
        const angle1 = (startAngle + angleStep * i) * (Math.PI / 180);
        const angle2 = (startAngle + angleStep * (i + 1)) * (Math.PI / 180);

        const x1 = centerX + radius * Math.cos(angle1);
        const y1 = centerY + radius * Math.sin(angle1);
        const x2 = centerX + radius * Math.cos(angle2);
        const y2 = centerY + radius * Math.sin(angle2);

        doc.setFillColor(item.color[0], item.color[1], item.color[2]);
        doc.triangle(centerX, centerY, x1, y1, x2, y2, 'F');
      }

      if (sliceAngle > 30) {
        const midAngle = startAngle + sliceAngle / 2;
        const rad = (midAngle * Math.PI) / 180;
        const labelDistance = radius * 0.65;
        const labelX = centerX + labelDistance * Math.cos(rad);
        const labelY = centerY + labelDistance * Math.sin(rad);

        const percentage = Math.round((item.value / total) * 100);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`${percentage}%`, labelX, labelY, { align: 'center' });
      }

      startAngle += sliceAngle;
    });

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.circle(centerX, centerY, radius, 'S');
  }

  private drawLegend(
    doc: jsPDF,
    x: number,
    y: number,
    data: { label: string; value: number; color: number[] }[]
  ) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const boxSize = 4;
    const lineHeight = 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    data.forEach((item, index) => {
      const yPos = y + index * lineHeight;
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(x, yPos - 3, boxSize, boxSize, 'F');

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.rect(x, yPos - 3, boxSize, boxSize, 'S');

      doc.setTextColor(60, 60, 60);
      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
      const text = `${item.label}: ${item.value} (${percentage}%)`;
      doc.text(text, x + boxSize + 2, yPos);
    });
  }
}
