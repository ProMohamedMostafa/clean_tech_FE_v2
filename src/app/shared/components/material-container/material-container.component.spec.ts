import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialContainerComponent } from './material-container.component';

describe('MaterialContainerComponent', () => {
  let component: MaterialContainerComponent;
  let fixture: ComponentFixture<MaterialContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
