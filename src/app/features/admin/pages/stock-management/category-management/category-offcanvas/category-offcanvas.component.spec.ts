import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryOffcanvasComponent } from './category-offcanvas.component';

describe('CategoryOffcanvasComponent', () => {
  let component: CategoryOffcanvasComponent;
  let fixture: ComponentFixture<CategoryOffcanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryOffcanvasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryOffcanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
