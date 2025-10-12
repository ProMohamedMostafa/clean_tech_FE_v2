import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedAttendancesComponent } from './deleted-attendances.component';

describe('DeletedAttendancesComponent', () => {
  let component: DeletedAttendancesComponent;
  let fixture: ComponentFixture<DeletedAttendancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedAttendancesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedAttendancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
