import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorManagementComponent } from './sensor-management.component';

describe('SensorManagementComponent', () => {
  let component: SensorManagementComponent;
  let fixture: ComponentFixture<SensorManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
