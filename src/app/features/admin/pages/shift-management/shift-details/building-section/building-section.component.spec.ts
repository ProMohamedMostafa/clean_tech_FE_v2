import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingSectionComponent } from './building-section.component';

describe('BuildingSectionComponent', () => {
  let component: BuildingSectionComponent;
  let fixture: ComponentFixture<BuildingSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuildingSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
