import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackFilterComponent } from './feedback-filter.component';

describe('FeedbackFilterComponent', () => {
  let component: FeedbackFilterComponent;
  let fixture: ComponentFixture<FeedbackFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
