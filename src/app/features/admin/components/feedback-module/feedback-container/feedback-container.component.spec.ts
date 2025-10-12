import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackContainerComponent } from './feedback-container.component';

describe('FeedbackContainerComponent', () => {
  let component: FeedbackContainerComponent;
  let fixture: ComponentFixture<FeedbackContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
