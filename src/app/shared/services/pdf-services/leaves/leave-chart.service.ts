import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { LeaveStatusData, LeaveTypeData } from './leave-report.model';

@Injectable({ providedIn: 'root' })
export class LeaveChartService {
  private chartColors = {
    status: {
      pending: [255, 193, 7],
      approved: [76, 175, 80],
      rejected: [244, 67, 54],
      cancelled: [158, 158, 158],
    },
    type: {
      annual: [33, 150, 243],
      sick: [255, 152, 0],
      casual: [156, 39, 176],
      ordinary: [121, 85, 72],
    },
  };

  addStatusChart(doc: jsPDF, x: number, y: number, data: LeaveStatusData) {
    // Prepare chart data array
    const chartData = [];

    if (data.pending > 0)
      chartData.push({
        label: 'Pending',
        value: data.pending,
        color: this.chartColors.status.pending,
      });

    if (data.approved > 0)
      chartData.push({
        label: 'Approved',
        value: data.approved,
        color: this.chartColors.status.approved,
      });

    if (data.rejected > 0)
      chartData.push({
        label: 'Rejected',
        value: data.rejected,
        color: this.chartColors.status.rejected,
      });

    if (data.cancelled && data.cancelled > 0)
      chartData.push({
        label: 'Cancelled',
        value: data.cancelled,
        color: this.chartColors.status.cancelled,
      });

    this.drawChartContainer(doc, x, y, 'Leave Status Distribution', chartData);
  }

  addTypeChart(doc: jsPDF, x: number, y: number, data: any) {
    // Prepare chart data array
    const chartData = [];

    if (data.annual > 0)
      chartData.push({
        label: 'Annual',
        value: data.annual,
        color: this.chartColors.type.annual,
      });

    if (data.sick > 0)
      chartData.push({
        label: 'Sick',
        value: data.sick,
        color: this.chartColors.type.sick,
      });

    if (data.casual && data.casual > 0)
      chartData.push({
        label: 'Casual',
        value: data.casual,
        color: this.chartColors.type.casual,
      });

    if (data.ordinary && data.ordinary > 0)
      chartData.push({
        label: 'Ordinary',
        value: data.ordinary,
        color: this.chartColors.type.ordinary,
      });

    this.drawChartContainer(doc, x, y, 'Leave Type Distribution', chartData);
  }

  private drawChartContainer(
    doc: jsPDF,
    x: number,
    y: number,
    title: string,
    data: { label: string; value: number; color: number[] }[]
  ) {
    const containerWidth = 90;
    const containerHeight = 60;
    const padding = 6;

    const radius = 16;
    const legendWidth = 28;
    const gap = 6;

    /** Border */
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.4);
    doc.rect(x, y, containerWidth, containerHeight);

    /** Title */
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(title, x + padding, y + 8);

    /** Center block (pie + legend) */
    const innerWidth = containerWidth - padding * 2;
    const blockWidth = radius * 2 + gap + legendWidth;

    const blockStartX = x + padding + (innerWidth - blockWidth) / 2;

    const centerX = blockStartX + radius;
    const centerY = y + containerHeight / 2 + 6;

    this.drawPieChart(doc, centerX, centerY, radius, data);
    this.drawLegend(
      doc,
      centerX + radius + gap,
      centerY - (data.length * 6) / 2,
      data
    );
  }

  private drawPieChart(
    doc: jsPDF,
    cx: number,
    cy: number,
    r: number,
    data: { label: string; value: number; color: number[] }[]
  ) {
    const total = data.reduce((s, d) => s + d.value, 0);
    let startAngle = -90;

    if (!total) return;

    data.forEach((item) => {
      if (!item.value) return;

      const slice = (item.value / total) * 360;
      const steps = Math.max(30, Math.ceil(slice));
      const step = slice / steps;

      for (let i = 0; i < steps; i++) {
        const a1 = ((startAngle + step * i) * Math.PI) / 180;
        const a2 = ((startAngle + step * (i + 1)) * Math.PI) / 180;

        doc.setFillColor(item.color[0], item.color[1], item.color[2]);
        doc.triangle(
          cx,
          cy,
          cx + r * Math.cos(a1),
          cy + r * Math.sin(a1),
          cx + r * Math.cos(a2),
          cy + r * Math.sin(a2),
          'F'
        );
      }

      startAngle += slice;
    });

    doc.setDrawColor(190, 190, 190);
    doc.setLineWidth(0.3);
    doc.circle(cx, cy, r, 'S');
  }

  private drawLegend(
    doc: jsPDF,
    x: number,
    y: number,
    data: { label: string; value: number; color: number[] }[]
  ) {
    const total = data.reduce((s, d) => s + d.value, 0);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');

    data.forEach((item, i) => {
      const yPos = y + i * 6;

      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(x, yPos - 3, 4, 4, 'F');

      const percent = total ? Math.round((item.value / total) * 100) : 0;
      doc.setTextColor(60, 60, 60);
      doc.text(`${item.label} (${percent}%)`, x + 6, yPos);
    });
  }
}
