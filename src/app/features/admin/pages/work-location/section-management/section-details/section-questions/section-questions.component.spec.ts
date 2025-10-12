import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionQuestionsComponent } from './section-questions.component';

describe('SectionQuestionsComponent', () => {
  let component: SectionQuestionsComponent;
  let fixture: ComponentFixture<SectionQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionQuestionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
