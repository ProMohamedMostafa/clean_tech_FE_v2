import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorDetailsInfoComponent } from './sensor-details-info.component';

describe('SensorDetailsInfoComponent', () => {
  let component: SensorDetailsInfoComponent;
  let fixture: ComponentFixture<SensorDetailsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorDetailsInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorDetailsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
