import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackCardComponent } from '../feedback-card/feedback-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-feedback-container',
  standalone: true,
  imports: [CommonModule, FeedbackCardComponent,TranslateModule],
  templateUrl: './feedback-container.component.html',
  styleUrls: ['./feedback-container.component.scss'],
})
export class FeedbackContainerComponent implements OnInit, OnChanges {
  @Output() contentTypeChanged = new EventEmitter<'feedback' | 'audits'>();

  @Input() feedbacks: any[] = [];

  @Input() currentPage: number = 1;
  @Input() totalPages: number = 2;
  @Input() totalCount: number = 16;
  @Input() pageSize: number = 8;

  @Output() pageChanged = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<number>();
  @Output() viewFeedback = new EventEmitter<any>();
  @Output() editFeedback = new EventEmitter<any>();
  @Output() deleteFeedback = new EventEmitter<any>();
  @Output() collapseAll = new EventEmitter<void>();
  @Output() expandAll = new EventEmitter<void>();

  collapsedFeedbackIds: number[] = [];

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['feedbacks']) {
      this.resetComponentState();
    }
  }

  private initializeComponent(): void {
    this.collapsedFeedbackIds = this.feedbacks.map((f) => f.id);
  }

  private resetComponentState(): void {
    this.collapsedFeedbackIds = this.feedbacks.map((f) => f.id);
  }

  isCollapsed(id: number): boolean {
    return this.collapsedFeedbackIds.includes(id);
  }

  onCollapseAll(): void {
    this.collapsedFeedbackIds = this.feedbacks.map((f) => f.id);
    this.collapseAll.emit();
  }

  onExpandAll(): void {
    this.collapsedFeedbackIds = [];
    this.expandAll.emit();
  }

  onViewFeedback(feedback: any): void {
    this.viewFeedback.emit(feedback);
  }

  onEditFeedback(feedback: any): void {
    this.editFeedback.emit(feedback);
  }

  onDeleteFeedback(feedback: any): void {
    const feedbackId = feedback.id;
    this.collapsedFeedbackIds = this.collapsedFeedbackIds.filter(
      (id) => id !== feedbackId
    );
    this.deleteFeedback.emit(feedback);
  }

  pageSizeOptions: number[] = [4, 8, 12, 16, 20, 24, 50, 100];

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
    if (page >= 1 && page <= this.totalPages) {
      this.pageChanged.emit(page);
    }
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newPageSize = parseInt(select.value, 10);

    if (newPageSize && newPageSize !== this.pageSize) {
      this.pageSizeChanged.emit(newPageSize);
    }
  }

  getItemRange(): { start: number; end: number } {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalCount);
    return { start, end };
  }

  trackByFeedbackId(index: number, feedback: any): number {
    return feedback.id;
  }

  // Add this method to your component class
  onContentTypeChange(type: 'feedback' | 'audits'): void {
    this.contentTypeChanged.emit(type);
  }
}
