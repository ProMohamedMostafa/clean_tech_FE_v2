import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditsSectionComponent } from './audits-section.component';

describe('AuditsSectionComponent', () => {
  let component: AuditsSectionComponent;
  let fixture: ComponentFixture<AuditsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
