import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveOffcanvasComponent } from './leave-offcanvas.component';

describe('LeaveOffcanvasComponent', () => {
  let component: LeaveOffcanvasComponent;
  let fixture: ComponentFixture<LeaveOffcanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveOffcanvasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveOffcanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
