import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedShiftsComponent } from './deleted-shifts.component';

describe('DeletedShiftsComponent', () => {
  let component: DeletedShiftsComponent;
  let fixture: ComponentFixture<DeletedShiftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedShiftsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedShiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
