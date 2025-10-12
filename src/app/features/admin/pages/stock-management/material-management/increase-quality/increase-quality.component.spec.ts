import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncreaseQualityComponent } from './increase-quality.component';

describe('IncreaseQualityComponent', () => {
  let component: IncreaseQualityComponent;
  let fixture: ComponentFixture<IncreaseQualityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncreaseQualityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncreaseQualityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
