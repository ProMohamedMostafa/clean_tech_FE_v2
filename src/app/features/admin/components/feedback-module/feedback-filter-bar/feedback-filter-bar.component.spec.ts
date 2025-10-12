import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackFilterBarComponent } from './feedback-filter-bar.component';

describe('FeedbackFilterBarComponent', () => {
  let component: FeedbackFilterBarComponent;
  let fixture: ComponentFixture<FeedbackFilterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackFilterBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackFilterBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
