import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaFilterComponent } from './area-filter.component';

describe('AreaFilterComponent', () => {
  let component: AreaFilterComponent;
  let fixture: ComponentFixture<AreaFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
