import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedOrganizationsComponent } from './deleted-organizations.component';

describe('DeletedOrganizationsComponent', () => {
  let component: DeletedOrganizationsComponent;
  let fixture: ComponentFixture<DeletedOrganizationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedOrganizationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedOrganizationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
