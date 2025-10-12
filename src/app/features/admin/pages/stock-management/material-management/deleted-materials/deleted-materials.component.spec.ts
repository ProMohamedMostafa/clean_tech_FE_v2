import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedMaterialsComponent } from './deleted-materials.component';

describe('DeletedMaterialsComponent', () => {
  let component: DeletedMaterialsComponent;
  let fixture: ComponentFixture<DeletedMaterialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedMaterialsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
