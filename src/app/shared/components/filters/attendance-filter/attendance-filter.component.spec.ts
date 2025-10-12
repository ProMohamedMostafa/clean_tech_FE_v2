import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceFilterComponent } from './attendance-filter.component';

describe('AttendanceFilterComponent', () => {
  let component: AttendanceFilterComponent;
  let fixture: ComponentFixture<AttendanceFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
