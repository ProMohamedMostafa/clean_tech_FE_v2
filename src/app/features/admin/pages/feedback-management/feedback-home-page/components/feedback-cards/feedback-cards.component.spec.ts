import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackCardsComponent } from './feedback-cards.component';

describe('FeedbackCardsComponent', () => {
  let component: FeedbackCardsComponent;
  let fixture: ComponentFixture<FeedbackCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
