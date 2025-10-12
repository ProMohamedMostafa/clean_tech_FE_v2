import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedSectionsComponent } from './deleted-sections.component';

describe('DeletedSectionsComponent', () => {
  let component: DeletedSectionsComponent;
  let fixture: ComponentFixture<DeletedSectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedSectionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
