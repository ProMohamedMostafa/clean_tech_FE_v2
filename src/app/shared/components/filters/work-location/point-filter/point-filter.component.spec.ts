import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointFilterComponent } from './point-filter.component';

describe('PointFilterComponent', () => {
  let component: PointFilterComponent;
  let fixture: ComponentFixture<PointFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
