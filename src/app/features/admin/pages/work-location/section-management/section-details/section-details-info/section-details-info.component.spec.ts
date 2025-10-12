import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionDetailsInfoComponent } from './section-details-info.component';

describe('SectionDetailsInfoComponent', () => {
  let component: SectionDetailsInfoComponent;
  let fixture: ComponentFixture<SectionDetailsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionDetailsInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionDetailsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
