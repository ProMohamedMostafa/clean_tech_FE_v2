// question-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Choice } from '../../../models/feedback/question.model';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './question-card.component.html',
  styleUrls: ['./question-card.component.scss'],
})
export class QuestionCardComponent {
  @Input() showButtons: boolean = true;
  @Input() showCheck: boolean = true;

  @Input() questionText: string = '';
  @Input() answers: Choice[] = [];
  @Input() isSelected: boolean = false;
  @Input() isPreChecked: boolean = false;
  @Input() isCollapsed: boolean = true;
  @Input() questionType: string = '';
  @Input() typeId!: number;

  @Output() selectChange = new EventEmitter<boolean>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() toggleAnswers = new EventEmitter<boolean>();
  @Output() unassignPreChecked = new EventEmitter<void>();

  // Static template options for different question types
  private staticAnswers: { [key: number]: Choice[] } = {
    3: [
      // Rating
      { id: 1, text: '1 Star', image: null, icon: '⭐' },
      { id: 2, text: '2 Stars', image: null, icon: '⭐⭐' },
      { id: 3, text: '3 Stars', image: null, icon: '⭐⭐⭐' },
      { id: 4, text: '4 Stars', image: null, icon: '⭐⭐⭐⭐' },
      { id: 5, text: '5 Stars', image: null, icon: '⭐⭐⭐⭐⭐' },
    ],
    5: [
      // RatingStar
      { id: 1, text: '1 Star', image: null, icon: '⭐' },
      { id: 2, text: '2 Stars', image: null, icon: '⭐⭐' },
      { id: 3, text: '3 Stars', image: null, icon: '⭐⭐⭐' },
      { id: 4, text: '4 Stars', image: null, icon: '⭐⭐⭐⭐' },
      { id: 5, text: '5 Stars', image: null, icon: '⭐⭐⭐⭐⭐' },
    ],
    6: [
      // RatingEmoji
      { id: 1, text: 'Very Bad', image: null, icon: '😡' },
      { id: 2, text: 'Bad', image: null, icon: '😞' },
      { id: 3, text: 'Neutral', image: null, icon: '😐' },
      { id: 4, text: 'Good', image: null, icon: '😊' },
      { id: 5, text: 'Excellent', image: null, icon: '😍' },
    ],
  };

  // Get the appropriate answers based on question type
  get displayAnswers(): Choice[] {
    const answersToShow = this.shouldUseStaticTemplate
      ? this.getStaticAnswers()
      : this.answers || [];

    return answersToShow;
  }

  // Static template options for different question types
  private getStaticAnswers(): Choice[] {
    return this.staticAnswers[this.typeId] || [];
  }

  // Check if question type should use static templates
  get shouldUseStaticTemplate(): boolean {
    return [3, 5, 6].includes(this.typeId);
  }

  async onSelectChange(event: Event): Promise<void> {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;

    if (this.isPreChecked && !isChecked) {
      event.preventDefault();
      checkbox.checked = true;

      const result = await Swal.fire({
        title: 'Unassign Question?',
        text: 'This question is already assigned. Are you sure you want to unassign it?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, unassign it',
        cancelButtonText: 'Keep assigned',
      });

      if (result.isConfirmed) {
        this.unassignPreChecked.emit();
      }
    } else {
      this.selectChange.emit(isChecked);
    }
  }

  onToggleAnswers(): void {
    const newCollapsedState = !this.isCollapsed;
    this.toggleAnswers.emit(newCollapsedState);
  }

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }

  onImageError(answer: Choice): void {
    if (answer.image && typeof answer.image === 'object') {
      answer.image = null;
    }
  }

  hasImage(answer: Choice): boolean {
    return !!(answer.image && answer.image);
  }
}
