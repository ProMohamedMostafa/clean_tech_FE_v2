import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core'; // ✅ Added
import { Subscription } from 'rxjs';

@Component({
  selector: 'task-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule], // ✅ Added
  templateUrl: './task-comments.component.html',
  styleUrls: ['./task-comments.component.scss'],
})
export class TaskCommentsComponent implements AfterViewChecked {
  @Input() comments: any[] = [];
  @Input() taskId!: string;
  @Input() userImage: string | null = null;
  @Output() commentAdded = new EventEmitter<{
    comment: string;
    files: File[];
  }>();
  @ViewChild('commentContainer') commentContainer!: ElementRef;

  newComment: string = '';
  selectedFiles: File[] = [];
  commentSub!: Subscription;
  private shouldScrollToBottom = false;

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  onFileChange(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  addComment(): void {
    if (!this.newComment.trim() && this.selectedFiles.length === 0) return;

    this.commentAdded.emit({
      comment: this.newComment,
      files: this.selectedFiles,
    });

    this.resetCommentForm();
  }

  private resetCommentForm(): void {
    this.newComment = '';
    this.selectedFiles = [];
    const fileInput = document.querySelector('.file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  isImageFile(path: string): boolean {
    return /\.(jpe?g|png|gif|bmp|webp)$/i.test(path);
  }

  isSpecialFile(path: string): boolean {
    return /\.(pdf|docx?|xlsx?|pptx?|txt|zip)$/i.test(path);
  }

  formatFileSize(size: number): string {
    if (!size) return '0 B';
    if (size < 1024) return `${size} B`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    else return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  scrollToBottom(): void {
    try {
      if (this.commentContainer) {
        const container = this.commentContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  getFileIcon(path: string): string {
    if (path.endsWith('.pdf')) return 'fa-file-pdf';
    if (path.endsWith('.doc') || path.endsWith('.docx')) return 'fa-file-word';
    if (path.endsWith('.xls') || path.endsWith('.xlsx')) return 'fa-file-excel';
    if (path.endsWith('.ppt') || path.endsWith('.pptx'))
      return 'fa-file-powerpoint';
    if (path.endsWith('.zip')) return 'fa-file-archive';
    if (path.endsWith('.txt')) return 'fa-file-alt';
    if (this.isImageFile(path)) return 'fa-file-image';
    return 'fa-file';
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;

    // Use bracket notation to satisfy TypeScript strict mode
    if (!imgElement.dataset['errorHandled']) {
      imgElement.src = 'assets/default-avatar.png';
      imgElement.dataset['errorHandled'] = 'true';
    }
  }
}
