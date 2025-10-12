import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorManagementComponent } from './floor-management.component';

describe('FloorManagementComponent', () => {
  let component: FloorManagementComponent;
  let fixture: ComponentFixture<FloorManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
