import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavesFilterComponent } from './leaves-filter.component';

describe('LeavesFilterComponent', () => {
  let component: LeavesFilterComponent;
  let fixture: ComponentFixture<LeavesFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeavesFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeavesFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
