import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorDetailsComponent } from './floor-details.component';

describe('FloorDetailsComponent', () => {
  let component: FloorDetailsComponent;
  let fixture: ComponentFixture<FloorDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
