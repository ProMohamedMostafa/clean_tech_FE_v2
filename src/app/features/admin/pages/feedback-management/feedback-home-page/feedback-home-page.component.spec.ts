import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackHomePageComponent } from './feedback-home-page.component';

describe('FeedbackHomePageComponent', () => {
  let component: FeedbackHomePageComponent;
  let fixture: ComponentFixture<FeedbackHomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackHomePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackHomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
