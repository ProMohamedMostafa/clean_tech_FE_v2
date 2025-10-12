import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedAreasComponent } from './deleted-areas.component';

describe('DeletedAreasComponent', () => {
  let component: DeletedAreasComponent;
  let fixture: ComponentFixture<DeletedAreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedAreasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
