import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskCardComponent } from '../task-card/task-card.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-task-container',
  standalone: true,
  imports: [TaskCardComponent, CommonModule, TranslateModule],
  templateUrl: './task-container.component.html',
  styleUrl: './task-container.component.scss',
})
export class TaskContainerComponent {
  @Input() tasks: any[] = [];
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalCount = 0;
  @Input() pageSize = 12;
  @Input() currentRoute: string = ''; // Add this input

  @Output() pageChanged = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<number>();
  @Output() viewTask = new EventEmitter<any>();
  @Output() editTask = new EventEmitter<any>();
  @Output() deleteTask = new EventEmitter<any>();
  @Output() archiveTask = new EventEmitter<any>();
  @Output() unarchiveTask = new EventEmitter<any>();
  @Output() statusFilterChange = new EventEmitter<string>();

  getPageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageChange(page: number): void {
    this.pageChanged.emit(page);
  }

  onStatusFilterChange(option: string): void {
    this.statusFilterChange.emit(option);
  }

  onViewTask(task: any): void {
    this.viewTask.emit(task);
  }

  onEditTask(task: any): void {
    this.editTask.emit(task);
  }

  onDeleteTask(task: any): void {
    this.deleteTask.emit(task);
  }

  onArchiveTask(task: any): void {
    this.archiveTask.emit(task);
  }

  onUnarchiveTask(task: any): void {
    this.unarchiveTask.emit(task);
  }
}
