import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackNameLocationComponent } from './feedback-name-location.component';

describe('FeedbackNameLocationComponent', () => {
  let component: FeedbackNameLocationComponent;
  let fixture: ComponentFixture<FeedbackNameLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackNameLocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackNameLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
