import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditsPerMonthGraphComponent } from './audits-per-month-graph.component';

describe('AuditsPerMonthGraphComponent', () => {
  let component: AuditsPerMonthGraphComponent;
  let fixture: ComponentFixture<AuditsPerMonthGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditsPerMonthGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditsPerMonthGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
