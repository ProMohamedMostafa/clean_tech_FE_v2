import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorFilterComponent } from './sensor-filter.component';

describe('SensorFilterComponent', () => {
  let component: SensorFilterComponent;
  let fixture: ComponentFixture<SensorFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
