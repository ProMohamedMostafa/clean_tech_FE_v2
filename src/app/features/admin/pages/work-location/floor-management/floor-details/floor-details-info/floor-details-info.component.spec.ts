import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorDetailsInfoComponent } from './floor-details-info.component';

describe('FloorDetailsInfoComponent', () => {
  let component: FloorDetailsInfoComponent;
  let fixture: ComponentFixture<FloorDetailsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorDetailsInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorDetailsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
