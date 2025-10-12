import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditorDashboardPageComponent } from './auditor-dashboard-page.component';

describe('AuditorDashboardPageComponent', () => {
  let component: AuditorDashboardPageComponent;
  let fixture: ComponentFixture<AuditorDashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditorDashboardPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditorDashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
