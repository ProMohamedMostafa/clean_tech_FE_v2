// session-details-modal.component.ts
import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Choice {
  id: number;
  text: string | null;
  image: string | null;
  icon: string | null;
}

interface Question {
  id: number;
  questionText: string;
  type: 'Radio' | 'Rating' | 'Bool' | 'Text' | 'Checkbox';
  choices: Choice[];
  textAnswer: string | null;
  rateAnswer: number | null;
  boolAnswer: boolean | null;
  choiceIdAnswer: number | null;
  choiceIdsAnswer: number[] | null;
}

interface SessionData {
  buildingName: string;
  floorName: string;
  sectionName: string;
  date: string;
  time: string;
  totalQuestionCount: number;
  completedQuestionCount: number;
  questions: Question[];
}

@Component({
  selector: 'app-session-details-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './app-session-details-modal.component.html',
  styleUrls: ['./app-session-details-modal.component.scss'],
})
export class SessionDetailsModalComponent {
 @Input() sessionData!: SessionData;
  @Input() onClose: () => void = () => {};

  constructor(private translate: TranslateService) {}

  // Close modal on ESC key
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.onClose();
  }

  // Helper method to get translated question types
  getQuestionTypeTranslation(type: string): string {
    const typeMap: { [key: string]: string } = {
      'Radio': 'QUESTION_TYPES.RADIO',
      'Rating': 'QUESTION_TYPES.RATING',
      'Bool': 'QUESTION_TYPES.BOOLEAN',
      'Text': 'QUESTION_TYPES.TEXT',
      'Checkbox': 'QUESTION_TYPES.CHECKBOX'
    };
    
    const translationKey = typeMap[type] || 'QUESTION_TYPES.UNKNOWN';
    return this.translate.instant(translationKey);
  }

  hasAnswer(question: any): boolean {
    return (
      question.textAnswer !== null ||
      question.rateAnswer !== null ||
      question.boolAnswer !== null ||
      question.choiceIdAnswer !== null ||
      (question.choiceIdsAnswer && question.choiceIdsAnswer.length > 0)
    );
  }

  getProgressPercentage(): number {
    if (!this.sessionData?.totalQuestionCount) return 0;
    return (
      (this.sessionData.completedQuestionCount /
        this.sessionData.totalQuestionCount) *
      100
    );
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getSelectedChoice(question: Question): Choice | null {
    if (question.choiceIdAnswer && question.choices) {
      return (
        question.choices.find(
          (choice) => choice.id === question.choiceIdAnswer
        ) || null
      );
    }
    return null;
  }

  getSelectedChoices(question: Question): Choice[] {
    if (
      question.choiceIdsAnswer &&
      question.choices &&
      question.choiceIdsAnswer.length > 0
    ) {
      return question.choices.filter((choice) =>
        question.choiceIdsAnswer?.includes(choice.id)
      );
    }
    return [];
  }

  // Handle image loading errors
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
  }

  // Check if a choice is selected
  isChoiceSelected(question: Question, choiceId: number): boolean {
    if (question.type === 'Radio' && question.choiceIdAnswer === choiceId) {
      return true;
    }

    if (question.type === 'Checkbox' && question.choiceIdsAnswer) {
      return question.choiceIdsAnswer.includes(choiceId);
    }

    return false;
  }

  // Check if question should show choices (for rating questions with icon choices)
  shouldShowChoices(question: Question): boolean {
    // For rating questions, only show choices if they contain icons (like star ratings)
    if (question.type === 'Rating') {
      return question.choices.some((choice) => choice.icon !== null);
    }

    // For other question types, show choices if they exist
    return question.choices.length > 0;
  }

  // Get rating scale from choices (for rating questions)
  getRatingScale(question: Question): number {
    if (question.type === 'Rating' && question.choices.length > 0) {
      // Try to parse the first choice's icon as a number to get the scale
      const scale = parseInt(question.choices[0]?.icon || '5');
      return isNaN(scale) ? 5 : scale;
    }
    return 5; // Default to 5-point scale
  }
}
