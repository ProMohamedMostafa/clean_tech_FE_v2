import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointDetailsInfoComponent } from './point-details-info.component';

describe('PointDetailsInfoComponent', () => {
  let component: PointDetailsInfoComponent;
  let fixture: ComponentFixture<PointDetailsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointDetailsInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointDetailsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
