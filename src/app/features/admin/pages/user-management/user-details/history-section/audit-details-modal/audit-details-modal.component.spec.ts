import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditDetailsModalComponent } from './audit-details-modal.component';

describe('AuditDetailsModalComponent', () => {
  let component: AuditDetailsModalComponent;
  let fixture: ComponentFixture<AuditDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditDetailsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
