import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingDetailsInfoComponent } from './building-details-info.component';

describe('BuildingDetailsInfoComponent', () => {
  let component: BuildingDetailsInfoComponent;
  let fixture: ComponentFixture<BuildingDetailsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingDetailsInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuildingDetailsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
