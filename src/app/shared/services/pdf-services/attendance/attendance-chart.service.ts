// attendance-chart.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { TaskStatusData } from './attendance-report.model';

@Injectable({ providedIn: 'root' })
export class AttendanceChartService {
  private chartColors = {
    status: {
      pending: [255, 193, 7],
      inProgress: [33, 150, 243],
      completed: [76, 175, 80],
      notResolved: [244, 67, 54],
    },
    lineChart: [33, 150, 243],
  };

  addStatusChart(doc: jsPDF, x: number, y: number, data: TaskStatusData) {
    const chartData = [
      {
        label: 'Pending',
        value: data.pending,
        color: this.chartColors.status.pending,
      },
      {
        label: 'In Progress',
        value: data.inProgress,
        color: this.chartColors.status.inProgress,
      },
      {
        label: 'Completed',
        value: data.completed,
        color: this.chartColors.status.completed,
      },
      {
        label: 'Not Resolved',
        value: data.notResolved,
        color: this.chartColors.status.notResolved,
      },
    ];

    this.drawChartWithLegend(
      doc,
      x,
      y,
      28,
      chartData,
      'Task Status Distribution'
    );
  }

  addMonthlyLineChart(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
    months: string[],
    values: number[],
    title = 'Monthly Task Values'
  ) {
    const padding = 8;
    const chartX = x + padding;
    const chartY = y + padding + 10; // leave space for title
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Draw border box
    doc.setDrawColor(150);
    doc.setLineWidth(0.5);
    doc.rect(x, y, width, height + 15, 'S');

    // Title
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x + width / 2, y + 10, { align: 'center' });

    // Axes & grid
    const maxValue = Math.max(...values, 10);
    const steps = 5;
    doc.setFontSize(6);
    for (let i = 0; i <= steps; i++) {
      const val = Math.round((maxValue / steps) * i);
      const posY = chartY + chartHeight - (chartHeight / steps) * i;
      doc.text(`${val}`, chartX - 4, posY + 1, { align: 'right' });
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(chartX, posY, chartX + chartWidth, posY);
    }

    // Plot points & line
    const pointSpacing = chartWidth / (months.length - 1);
    const [r, g, b] = this.chartColors.lineChart;
    const points: { x: number; y: number }[] = [];
    months.forEach((month, idx) => {
      const px = chartX + idx * pointSpacing;
      const py = chartY + chartHeight - (values[idx] / maxValue) * chartHeight;
      points.push({ x: px, y: py });
      doc.text(month, px, chartY + chartHeight + 5, { align: 'center' });
      doc.text(`${values[idx]}`, px, py - 1.5, { align: 'center' });
    });

    doc.setDrawColor(r, g, b);
    doc.setLineWidth(1);
    for (let i = 0; i < points.length - 1; i++) {
      doc.line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    }

    points.forEach((p) => {
      doc.setFillColor(r, g, b);
      doc.circle(p.x, p.y, 1.5, 'F');
    });

    // Axes
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(chartX, chartY, chartX, chartY + chartHeight);
    doc.line(
      chartX,
      chartY + chartHeight,
      chartX + chartWidth,
      chartY + chartHeight
    );
  }

  private drawChartWithLegend(
    doc: jsPDF,
    x: number,
    y: number,
    radius: number,
    data: { label: string; value: number; color: number[] }[],
    title: string
  ) {
    const padding = 8;
    const extraHeightForLegend = 25; // increase this to make border taller
    const boxSize = radius * 2 + padding * 2;

    // Draw border box with increased height
    doc.setDrawColor(150);
    doc.setLineWidth(0.5);
    doc.rect(x, y, boxSize, boxSize + extraHeightForLegend, 'S');

    // Title
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x + boxSize / 2, y + 10, { align: 'center' });

    // Pie center inside box with padding
    const centerX = x + padding + radius;
    const centerY = y + padding + radius + 5;

    this.drawPieChart(doc, centerX, centerY, radius, data);

    // Legend
    const legendX = x + padding;
    const legendY = centerY + radius + 8;
    this.drawLegend(doc, legendX, legendY, data);
  }

  private drawPieChart(
    doc: jsPDF,
    cx: number,
    cy: number,
    r: number,
    data: { label: string; value: number; color: number[] }[]
  ) {
    const total = data.reduce((s, i) => s + i.value, 0);
    if (!total) return;

    let startAngle = -90;
    data.forEach((item) => {
      const slice = (item.value / total) * 360;
      const steps = Math.max(40, Math.ceil(slice));
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
  }

  private drawLegend(
    doc: jsPDF,
    x: number,
    y: number,
    data: { label: string; value: number; color: number[] }[]
  ) {
    const total = data.reduce((s, i) => s + i.value, 0);
    let currentY = y;

    doc.setFontSize(6);
    data.forEach((item) => {
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(x, currentY - 3, 4, 4, 'F');
      const pct = total ? Math.round((item.value / total) * 100) : 0;
      doc.text(`${item.label}: ${item.value} (${pct}%)`, x + 6, currentY);
      currentY += 6;
    });
  }
}
