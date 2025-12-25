import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { TaskStatusData, TaskPriorityData } from './task-report.model';

@Injectable({ providedIn: 'root' })
export class TaskChartService {
  private chartColors = {
    status: {
      pending: [255, 193, 7],
      inProgress: [33, 150, 243],
      completed: [76, 175, 80],
      blocked: [244, 67, 54],
    },
    priority: {
      high: [244, 67, 54],
      medium: [255, 152, 0],
      low: [76, 175, 80],
    },
  };

  addStatusChart(doc: jsPDF, x: number, y: number, data: TaskStatusData) {
    this.drawChartContainer(doc, x, y, 'Task Status Distribution', [
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
    ]);
  }

  addPriorityChart(doc: jsPDF, x: number, y: number, data: TaskPriorityData) {
    this.drawChartContainer(doc, x, y, 'Task Priority Distribution', [
      {
        label: 'High',
        value: data.high,
        color: this.chartColors.priority.high,
      },
      {
        label: 'Medium',
        value: data.medium,
        color: this.chartColors.priority.medium,
      },
      { label: 'Low', value: data.low, color: this.chartColors.priority.low },
    ]);
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
    const legendWidth = 28; // estimated legend block width
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

    /** ---- CENTERING LOGIC ---- */
    const innerWidth = containerWidth - padding * 2;
    const chartBlockWidth = radius * 2 + gap + legendWidth;

    const blockStartX = x + padding + (innerWidth - chartBlockWidth) / 2;

    const centerX = blockStartX + radius;
    const centerY = y + containerHeight / 2 + 6;

    /** Pie */
    this.drawPieChart(doc, centerX, centerY, radius, data);

    /** Legend */
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

    data.forEach((item, i) => {
      const yPos = y + i * 6;

      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(x, yPos - 3, 4, 4, 'F');

      const percent = total ? Math.round((item.value / total) * 100) : 0;
      doc.text(`${item.label} (${percent}%)`, x + 6, yPos);
    });
  }

  // task-chart.service.ts (add this method)
  addDynamicStatusChart(
    doc: jsPDF,
    x: number,
    y: number,
    data: TaskStatusData
  ) {
    // Convert TaskStatusData to chart format
    const chartData = [];

    if (data.pending > 0)
      chartData.push({
        label: 'Pending',
        value: data.pending,
        color: this.chartColors.status.pending,
      });

    if (data.inProgress > 0)
      chartData.push({
        label: 'In Progress',
        value: data.inProgress,
        color: this.chartColors.status.inProgress,
      });

    if (data.completed > 0)
      chartData.push({
        label: 'Completed',
        value: data.completed,
        color: this.chartColors.status.completed,
      });

    if (data.blocked > 0)
      chartData.push({
        label: 'Blocked',
        value: data.blocked,
        color: this.chartColors.status.blocked,
      });

    if (data.waitingForApproval && data.waitingForApproval > 0)
      chartData.push({
        label: 'Waiting',
        value: data.waitingForApproval,
        color: [255, 193, 7], // Yellow for waiting
      });

    if (data.overdue && data.overdue > 0)
      chartData.push({
        label: 'Overdue',
        value: data.overdue,
        color: [244, 67, 54], // Red for overdue
      });

    this.drawChartContainer(doc, x, y, 'Task Status Distribution', chartData);
  }
}
