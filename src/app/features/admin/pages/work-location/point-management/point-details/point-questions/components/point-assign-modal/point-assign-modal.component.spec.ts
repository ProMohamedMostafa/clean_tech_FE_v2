import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointAssignModalComponent } from './point-assign-modal.component';

describe('PointAssignModalComponent', () => {
  let component: PointAssignModalComponent;
  let fixture: ComponentFixture<PointAssignModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointAssignModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointAssignModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
