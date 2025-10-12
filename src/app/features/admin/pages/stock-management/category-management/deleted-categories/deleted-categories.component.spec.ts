import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedCategoriesComponent } from './deleted-categories.component';

describe('DeletedCategoriesComponent', () => {
  let component: DeletedCategoriesComponent;
  let fixture: ComponentFixture<DeletedCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
