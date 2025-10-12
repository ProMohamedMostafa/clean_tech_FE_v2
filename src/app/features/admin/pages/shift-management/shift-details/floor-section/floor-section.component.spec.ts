import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorSectionComponent } from './floor-section.component';

describe('FloorSectionComponent', () => {
  let component: FloorSectionComponent;
  let fixture: ComponentFixture<FloorSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
