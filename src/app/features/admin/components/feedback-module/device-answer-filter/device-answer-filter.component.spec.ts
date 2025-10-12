import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceAnswerFilterComponent } from './device-answer-filter.component';

describe('DeviceAnswerFilterComponent', () => {
  let component: DeviceAnswerFilterComponent;
  let fixture: ComponentFixture<DeviceAnswerFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceAnswerFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceAnswerFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
