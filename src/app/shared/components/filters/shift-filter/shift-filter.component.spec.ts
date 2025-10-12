import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftFilterComponent } from './shift-filter.component';

describe('ShiftFilterComponent', () => {
  let component: ShiftFilterComponent;
  let fixture: ComponentFixture<ShiftFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
