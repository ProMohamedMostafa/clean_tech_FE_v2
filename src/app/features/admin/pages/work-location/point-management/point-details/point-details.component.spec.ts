import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointDetailsComponent } from './point-details.component';

describe('PointDetailsComponent', () => {
  let component: PointDetailsComponent;
  let fixture: ComponentFixture<PointDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
