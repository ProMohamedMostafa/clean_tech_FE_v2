import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceContainerComponent } from './device-container.component';

describe('DeviceContainerComponent', () => {
  let component: DeviceContainerComponent;
  let fixture: ComponentFixture<DeviceContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
