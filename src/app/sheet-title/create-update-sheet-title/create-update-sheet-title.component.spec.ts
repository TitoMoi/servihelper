import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateSheetTitleComponent } from './create-update-sheet-title.component';

describe('CreateUpdateSheetTitleComponent', () => {
  let component: CreateUpdateSheetTitleComponent;
  let fixture: ComponentFixture<CreateUpdateSheetTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CreateUpdateSheetTitleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUpdateSheetTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
