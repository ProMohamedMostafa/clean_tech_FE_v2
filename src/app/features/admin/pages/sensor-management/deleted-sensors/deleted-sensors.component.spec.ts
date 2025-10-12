import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedSensorsComponent } from './deleted-sensors.component';

describe('DeletedSensorsComponent', () => {
  let component: DeletedSensorsComponent;
  let fixture: ComponentFixture<DeletedSensorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedSensorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedSensorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
