import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDragHandle,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  Choice,
  Question,
  QuestionType,
} from '../../../models/feedback/question.model';

@Component({
  selector: 'app-create-question-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    CdkDrag,
    CdkDropList,
    CdkDragHandle,
  ],
  templateUrl: './create-question-modal.component.html',
  styleUrls: ['./create-question-modal.component.scss'],
})
export class CreateQuestionModalComponent {
  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef>;

  @Input() questionToEdit: Question | null = null;
  @Output() update = new EventEmitter<FormData>();
  @Output() create = new EventEmitter<FormData>();
  @Output() close = new EventEmitter<void>();

  QuestionType = QuestionType;
  questionText = '';
  selectedType: QuestionType = QuestionType.Radio;
  options: Choice[] = [];
  isEditMode = false;

  private readonly MAX_OPTIONS = 4;

  questionTypes = [
    { value: QuestionType.Radio, label: 'Multiple options' },
    { value: QuestionType.Checkbox, label: 'Checkbox' },
    { value: QuestionType.Text, label: 'Text input' },
    { value: QuestionType.RatingStar, label: 'Rating Stars' },
    { value: QuestionType.RatingEmoji, label: 'Rating Emojis' },
    { value: QuestionType.Bool, label: 'True or false' },
  ];

  // Define rating configurations with proper typing
  private readonly ratingIcons: Record<
    QuestionType.RatingStar | QuestionType.RatingEmoji,
    string[]
  > = {
    [QuestionType.RatingStar]: ['☆', '★'],
    [QuestionType.RatingEmoji]: ['😞', '😊'],
  };

  private readonly ratingLabels: Record<
    QuestionType.RatingStar | QuestionType.RatingEmoji,
    string[]
  > = {
    [QuestionType.RatingStar]: ['Poor', 'Good'],
    [QuestionType.RatingEmoji]: ['Unsatisfied', 'Satisfied'],
  };

  ngOnInit(): void {
    if (this.questionToEdit) {
      this.isEditMode = true;
      this.loadQuestionForEditing();
    } else {
      this.initializeRatingOptions();
    }
  }

  private loadQuestionForEditing(): void {
    if (!this.questionToEdit) return;

    this.questionText = this.questionToEdit.text;
    this.selectedType =
      QuestionType[this.questionToEdit.type as keyof typeof QuestionType];

    if (this.questionToEdit.choices?.length) {
      const choicesToLoad = this.shouldLimitOptions()
        ? this.questionToEdit.choices.slice(0, this.MAX_OPTIONS)
        : this.questionToEdit.choices;

      this.options = choicesToLoad.map((choice: any) => ({
        id: choice.id,
        text: choice.text || '',
        image: choice.image
          ? {
              file: new File([''], 'existing-image', { type: 'image/png' }),
              preview: choice.image,
            }
          : null,
        icon: choice.icon || null,
      }));
    }
  }

  onSave(): void {
    const formData = new FormData();
    formData.append('text', this.questionText);
    formData.append('type', String(this.selectedType));

    if (this.isEditMode && this.questionToEdit) {
      formData.append('id', String(this.questionToEdit.id));
    }

    if (this.showOptions()) {
      this.processOptions(formData);
    }

    this.isEditMode ? this.update.emit(formData) : this.create.emit(formData);
  }

  private processOptions(formData: FormData): void {
    this.options.forEach((option, index) => {
      if (this.isEditMode && option.id) {
        formData.append(`choices[${index}].id`, String(option.id));
      }

      formData.append(
        `choices[${index}].text`,
        this.isRatingType() ? '' : option.text || ''
      );

      if (this.isRatingType()) {
        formData.append(`choices[${index}].icon`, String(option.icon || 0));
      }

      this.processImageData(formData, option, index);
    });
  }

  private processImageData(
    formData: FormData,
    option: Choice,
    index: number
  ): void {
    const deleteImage = (option as any).deleteImage;

    formData.append(
      `choices[${index}].deleteImage`,
      deleteImage ? 'true' : 'false'
    );

    if (
      !deleteImage &&
      option.image?.file &&
      !option.image.preview?.startsWith('http')
    ) {
      formData.append(
        `choices[${index}].image`,
        option.image.file,
        option.image.file.name
      );
    }
  }

  showOptions(): boolean {
    return (
      [QuestionType.Radio, QuestionType.Checkbox].includes(this.selectedType) ||
      this.isRatingType()
    );
  }

  isRatingType(): boolean {
    return [QuestionType.RatingStar, QuestionType.RatingEmoji].includes(
      this.selectedType
    );
  }

  shouldLimitOptions(): boolean {
    return [QuestionType.Radio, QuestionType.Checkbox].includes(
      this.selectedType
    );
  }

  canAddMoreOptions(): boolean {
    return !this.shouldLimitOptions() || this.options.length < this.MAX_OPTIONS;
  }

  onTypeChange(): void {
    if (this.isRatingType()) {
      this.initializeRatingOptions();
    } else if (
      [QuestionType.Radio, QuestionType.Checkbox].includes(this.selectedType)
    ) {
      this.options = [];
    } else {
      this.options = [];
    }
  }

  private initializeRatingOptions(): void {
    if (this.isRatingType()) {
      this.options = [
        { text: '', image: null, icon: 0 },
        { text: '', image: null, icon: 1 },
      ];
    }
  }

  getRatingIcon(optionIndex: number): string {
    if (this.isRatingType()) {
      const icons =
        this.ratingIcons[
          this.selectedType as
            | QuestionType.RatingStar
            | QuestionType.RatingEmoji
        ];
      return icons?.[optionIndex] || '';
    }
    return '';
  }

  getRatingLabel(optionIndex: number): string {
    if (this.isRatingType()) {
      const labels =
        this.ratingLabels[
          this.selectedType as
            | QuestionType.RatingStar
            | QuestionType.RatingEmoji
        ];
      return labels?.[optionIndex] || '';
    }
    return '';
  }

  removeOption(index: number): void {
    if (this.isRatingType()) return;

    const removedOption = this.options[index];

    if (removedOption.id) {
      removedOption.text = '';
      removedOption.image = null;
      (removedOption as any).deleteImage = true;
      this.options[index] = removedOption;
    } else {
      this.options.splice(index, 1);
    }
  }

  drop(event: CdkDragDrop<Choice[]>): void {
    if (!this.isRatingType()) {
      moveItemInArray(this.options, event.previousIndex, event.currentIndex);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  triggerImageUpload(index: number): void {
    const fileInput = this.fileInputs.find((_, i) => i === index);
    fileInput?.nativeElement.click();
  }

  handleImageUpload(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const validImageTypes = ['png', 'jpg', 'jpeg', 'gif', 'svg'];

    if (!validImageTypes.includes(fileExt)) {
      console.error('Invalid image type');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.options[index].image = {
        file: file,
        preview: e.target?.result as string,
      };
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  addOption(): void {
    if (!this.isRatingType() && this.canAddMoreOptions()) {
      this.options.push({ text: '', image: null, icon: null });
    }
  }
}
