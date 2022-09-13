import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionListHorComponent } from './selection-list-hor.component';

describe('SelectionListHorComponent', () => {
  let component: SelectionListHorComponent;
  let fixture: ComponentFixture<SelectionListHorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectionListHorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionListHorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
