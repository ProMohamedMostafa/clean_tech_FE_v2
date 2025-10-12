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
  @Output() update = new EventEmitter<any>();
  @Output() create = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  QuestionType = QuestionType;
  questionText = '';
  selectedType: QuestionType = QuestionType.Radio; // Default to Radio
  selectedRatingType = 'stars'; // 'stars' or 'emojis'
  removedOptionIds: number[] = [];

  options: Choice[] = [];
  isEditMode = false;

  // Maximum options allowed for Multiple Choice and Checkbox
  private readonly MAX_OPTIONS = 4;

  questionTypes = [
    { value: QuestionType.Radio, label: 'Multiple options' },
    { value: QuestionType.Checkbox, label: 'Checkbox' },
    { value: QuestionType.Text, label: 'Text input' },
    { value: QuestionType.Rating, label: 'Rating' }, // Single Rating option
    { value: QuestionType.Bool, label: 'True or false' },
  ];

  ratingTypes = [
    { value: 'stars', label: 'Stars', icon: '★' },
    { value: 'emojis', label: 'Emojis', icon: '😊' },
  ];

  constructor() {
    this.initializeRatingOptions();
  }

  ngOnInit(): void {
    if (this.questionToEdit) {
      this.isEditMode = true;
      this.loadQuestionForEditing();
    } else {
      this.isEditMode = false;
      this.initializeRatingOptions();
    }
  }

  private loadQuestionForEditing(): void {
    if (!this.questionToEdit) return;

    this.questionText = this.questionToEdit.text;
    this.selectedType =
      QuestionType[this.questionToEdit.type as keyof typeof QuestionType];

    // Handle backward compatibility for existing rating questions
    if (this.selectedType === QuestionType.RatingStar) {
      this.selectedType = QuestionType.Rating;
      this.selectedRatingType = 'stars';
    } else if (this.selectedType === QuestionType.RatingEmoji) {
      this.selectedType = QuestionType.Rating;
      this.selectedRatingType = 'emojis';
    }

    if (this.questionToEdit.choices?.length) {
      if (this.isRatingType()) {
        const firstChoice = this.questionToEdit.choices[0];
      }

      // Limit to MAX_OPTIONS for Multiple Choice and Checkbox
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

    // Convert generic Rating to specific type based on selection
    let typeToSend = this.selectedType;
    if (this.selectedType === QuestionType.Rating) {
      typeToSend =
        this.selectedRatingType === 'stars'
          ? QuestionType.RatingStar
          : QuestionType.RatingEmoji;
    }
    formData.append('type', String(typeToSend));

    if (this.isEditMode && this.questionToEdit) {
      formData.append('id', String(this.questionToEdit.id));
    }

    if (this.showOptions()) {
      this.options.forEach((option, index) => {
        if (this.isEditMode && option.id) {
          formData.append(`choices[${index}].id`, String(option.id));
        }

        // Always send text for non-rating
        formData.append(
          `choices[${index}].text`,
          this.isRatingType() ? '' : option.text || ''
        );

        // Rating icons
        if (this.isRatingType()) {
          formData.append(`choices[${index}].icon`, String(option.icon || 0));
        }

        // Handle remove option / remove image logic
        if ((option as any).deleteImage) {
          // Mark this option for deletion
          formData.append(`choices[${index}].deleteImage`, 'true');
        } else {
          formData.append(`choices[${index}].deleteImage`, 'false');

          if (option.image?.file && !option.image.preview?.startsWith('http')) {
            // New uploaded image
            formData.append(
              `choices[${index}].image`,
              option.image.file,
              option.image.file.name
            );
          }
        }
      });
    }

    if (this.isEditMode) {
      this.update.emit(formData);
    } else {
      this.create.emit(formData);
    }
  }

  showOptions(): boolean {
    return [QuestionType.Radio, QuestionType.Checkbox].includes(
      this.selectedType
    );
  }

  showRatingTypeSelector(): boolean {
    return this.selectedType === QuestionType.Rating;
  }

  isRatingType(): boolean {
    return this.selectedType === QuestionType.Rating;
  }

  // Check if current type should limit options to MAX_OPTIONS
  shouldLimitOptions(): boolean {
    return [QuestionType.Radio, QuestionType.Checkbox].includes(
      this.selectedType
    );
  }

  // Check if user can add more options
  canAddMoreOptions(): boolean {
    if (!this.shouldLimitOptions()) {
      return true;
    }
    return this.options.length < this.MAX_OPTIONS;
  }

  onTypeChange(): void {
    if (this.selectedType === QuestionType.Rating) {
      this.selectedRatingType = 'stars';
      this.initializeRatingOptions();
    } else if (
      this.selectedType === QuestionType.Radio ||
      this.selectedType === QuestionType.Checkbox
    ) {
      this.options = [];
    } else {
      this.options = [];
    }
  }

  onRatingTypeChange(): void {
    this.initializeRatingOptions();
  }

  initializeRatingOptions(): void {
    if (this.selectedType === QuestionType.Rating) {
      this.options = [
        {
          text: '',
          image: null,
          icon: 0,
        },
        {
          text: '',
          image: null,
          icon: 1,
        },
      ];
    }
  }

  getRatingIcon(optionIndex: number): string {
    if (this.selectedRatingType === 'stars') {
      return optionIndex === 0 ? '☆' : '★';
    } else {
      return optionIndex === 0 ? '😞' : '😊';
    }
  }

  getRatingLabel(optionIndex: number): string {
    if (this.selectedRatingType === 'stars') {
      return optionIndex === 0 ? 'Poor' : 'Good';
    } else {
      return optionIndex === 0 ? 'Unsatisfied' : 'Satisfied';
    }
  }

  removeOption(index: number): void {
    if (this.isRatingType()) return;

    const removed = this.options[index];

    if (removed.id) {
      // Mark existing option for deletion
      removed.text = ''; // clear text
      removed.image = null; // clear image
      (removed as any).deleteImage = true;
      // Keep it in the list so onSave() can send deleteImage=true
      this.options[index] = removed;
    } else {
      // If it's a newly added option (no id), just remove it from array
      this.options.splice(index, 1);
    }
  }

  drop(event: CdkDragDrop<Choice[]>) {
    if (this.isRatingType()) {
      return;
    }
    moveItemInArray(this.options, event.previousIndex, event.currentIndex);
  }

  onCreate(): void {
    const formData = new FormData();

    let typeToSend = this.selectedType;
    if (this.selectedType === QuestionType.Rating) {
      typeToSend =
        this.selectedRatingType === 'stars'
          ? QuestionType.RatingStar
          : QuestionType.RatingEmoji;
    }

    formData.append('text', this.questionText);
    formData.append('type', String(typeToSend));

    if (this.showOptions()) {
      this.options.forEach((option, index) => {
        if (this.isRatingType()) {
          formData.append(`choices[${index}].text`, '');
          formData.append(`choices[${index}].icon`, String(option.icon));
        } else {
          formData.append(`choices[${index}].text`, option.text);
        }

        if (option.image?.file) {
          formData.append(
            `choices[${index}].image`,
            option.image.file,
            `choice_${index}_image`
          );
        } else {
          formData.append(`choices[${index}].image`, '');
        }
      });
    }

    this.create.emit(formData);
  }

  onClose(): void {
    this.close.emit();
  }

  triggerImageUpload(index: number): void {
    const fileInput = this.fileInputs.find((_, i) => i === index);
    if (fileInput) {
      fileInput.nativeElement.click();
    }
  }

  handleImageUpload(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const fileName = file.name;
      const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
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
  }

  addOption(): void {
    if (this.isRatingType()) {
      return;
    }

    // Check if we've reached the maximum options for Multiple Choice/Checkbox
    if (!this.canAddMoreOptions()) {
      return;
    }

    this.options.push({
      text: '',
      image: null,
      icon: null,
    });
  }
}
