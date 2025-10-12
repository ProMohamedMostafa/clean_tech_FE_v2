import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationDetailsInfoComponent } from './location-details-info.component';

describe('LocationDetailsInfoComponent', () => {
  let component: LocationDetailsInfoComponent;
  let fixture: ComponentFixture<LocationDetailsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationDetailsInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationDetailsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
