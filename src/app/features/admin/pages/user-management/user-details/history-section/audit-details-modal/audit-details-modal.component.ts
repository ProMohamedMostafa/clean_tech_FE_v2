import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AuditQuestion {
  id: number;
  questionText: string;
  typeId: number;
  type: string;
  choices: any[];
  textAnswer: string | null;
  rateAnswer: number | null;
  boolAnswer: boolean | null;
  choiceIdAnswer: number | null;
  choiceIdsAnswer: number[] | null;
  isAnswered: boolean;
}

export interface AuditRecordInfo {
  id: number;
  date: string;
  time: string;
  totalQuestionCount: number;
  completedQuestionCount: number;
}

@Component({
  selector: 'app-audit-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-details-modal.component.html',
  styleUrls: ['./audit-details-modal.component.scss']
})
export class AuditDetailsModalComponent implements OnInit {
  @Input() showModal = false;
  @Input() modalLoading = false;
  @Input() selectedRecordInfo: AuditRecordInfo | null = null;
  @Input() selectedAuditQuestions: AuditQuestion[] = [];
  
  @Output() closeModal = new EventEmitter<void>();

  ngOnInit(): void {}

  onCloseModal(): void {
    this.closeModal.emit();
  }

  getAnswerText(question: AuditQuestion): string {
    if (!question.isAnswered) {
      return 'No answer provided';
    }

    switch (question.type) {
      case 'Text':
        return question.textAnswer || 'No text provided';

      case 'Bool':
        return question.boolAnswer ? 'Yes' : 'No';

      case 'Rating':
        return question.rateAnswer ? `${question.rateAnswer}/5` : 'Not rated';

      case 'Radio':
        if (question.choiceIdAnswer) {
          const choice = question.choices.find(
            (c) => c.id === question.choiceIdAnswer
          );
          return choice?.text || 'Selected option';
        }
        return 'No option selected';

      case 'Checkbox':
        if (question.choiceIdsAnswer && question.choiceIdsAnswer.length > 0) {
          const selectedChoices = question.choices
            .filter((c) => question.choiceIdsAnswer?.includes(c.id))
            .map((c) => c.text);
          return selectedChoices.join(', ');
        }
        return 'No options selected';

      default:
        return 'Unknown answer type';
    }
  }

  getQuestionTypeIcon(type: string): string {
    switch (type) {
      case 'Text':
        return 'fas fa-keyboard';
      case 'Bool':
        return 'fas fa-toggle-on';
      case 'Rating':
        return 'fas fa-star';
      case 'Radio':
        return 'far fa-dot-circle';
      case 'Checkbox':
        return 'far fa-check-square';
      default:
        return 'fas fa-question';
    }
  }

  getAnswerStatusClass(question: AuditQuestion): string {
    return question.isAnswered ? 'answered' : 'not-answered';
  }
}