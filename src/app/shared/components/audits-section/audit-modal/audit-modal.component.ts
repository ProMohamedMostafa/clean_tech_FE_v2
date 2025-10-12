import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-audit-modal',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './audit-modal.component.html',
  styleUrl: './audit-modal.component.scss',
})
export class AuditModalComponent implements OnInit {
  @Input() showModal = false;
  @Input() questions: any[] = [];
  @Input() isLoading = false;
  @Input() isSubmitting = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() submitAudit = new EventEmitter<any>();

  answers: any = {};
  starOptions: any[] = [];
  emojiOptions: any[] = [];

  ngOnInit(): void {
    this.initializeStaticOptions();
    if (this.questions.length > 0) {
      this.initializeAnswers();
    }
  }

  ngOnChanges(): void {
    if (this.questions.length > 0) {
      this.initializeAnswers();
    }
  }

  initializeStaticOptions(): void {
    // Static star options for rating (type 3)
    this.starOptions = [
      { id: 1, text: '1 Star', icon: '⭐' },
      { id: 2, text: '2 Stars', icon: '⭐⭐' },
      { id: 3, text: '3 Stars', icon: '⭐⭐⭐' },
      { id: 4, text: '4 Stars', icon: '⭐⭐⭐⭐' },
      { id: 5, text: '5 Stars', icon: '⭐⭐⭐⭐⭐' },
    ];

    // Static emoji options for rating emoji (type 6)
    this.emojiOptions = [
      { id: 1, text: 'Very Sad', icon: '😢' },
      { id: 2, text: 'Sad', icon: '😞' },
      { id: 3, text: 'Neutral', icon: '😐' },
      { id: 4, text: 'Happy', icon: '😊' },
      { id: 5, text: 'Very Happy', icon: '😍' },
    ];
  }

  initializeAnswers(): void {
    this.answers = {};
    this.questions.forEach((question) => {
      if (question.typeId === 1) {
        this.answers[question.id] = [];
      } else {
        this.answers[question.id] = '';
      }
    });
  }

  onCheckboxChange(questionId: number, choiceId: number, event: any): void {
    if (!this.answers[questionId]) {
      this.answers[questionId] = [];
    }

    if (event.target.checked) {
      this.answers[questionId].push(choiceId);
    } else {
      this.answers[questionId] = this.answers[questionId].filter(
        (id: number) => id !== choiceId
      );
    }
  }

  onCloseModal(): void {
    this.answers = {};
    this.closeModal.emit();
  }

  onSubmitAudit(): void {
    this.submitAudit.emit(this.answers);
  }
}
