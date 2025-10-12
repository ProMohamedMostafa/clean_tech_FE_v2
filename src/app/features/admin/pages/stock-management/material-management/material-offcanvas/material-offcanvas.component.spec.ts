import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialOffcanvasComponent } from './material-offcanvas.component';

describe('MaterialOffcanvasComponent', () => {
  let component: MaterialOffcanvasComponent;
  let fixture: ComponentFixture<MaterialOffcanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialOffcanvasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialOffcanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
