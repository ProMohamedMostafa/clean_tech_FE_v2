import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedFloorsComponent } from './deleted-floors.component';

describe('DeletedFloorsComponent', () => {
  let component: DeletedFloorsComponent;
  let fixture: ComponentFixture<DeletedFloorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedFloorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedFloorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
