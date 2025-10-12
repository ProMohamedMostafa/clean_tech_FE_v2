import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFeedbackQuestionModalComponent } from './add-feedback-question-modal.component';

describe('AddFeedbackQuestionModalComponent', () => {
  let component: AddFeedbackQuestionModalComponent;
  let fixture: ComponentFixture<AddFeedbackQuestionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFeedbackQuestionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFeedbackQuestionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
