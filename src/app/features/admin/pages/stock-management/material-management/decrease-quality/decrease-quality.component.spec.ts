import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecreaseQualityComponent } from './decrease-quality.component';

describe('DecreaseQualityComponent', () => {
  let component: DecreaseQualityComponent;
  let fixture: ComponentFixture<DecreaseQualityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecreaseQualityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecreaseQualityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
