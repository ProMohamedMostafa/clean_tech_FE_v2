import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionSectionComponent } from './section-section.component';

describe('SectionSectionComponent', () => {
  let component: SectionSectionComponent;
  let fixture: ComponentFixture<SectionSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
