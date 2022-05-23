import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionSheetsAssignmentComponent } from './selection-sheets-assignment.component';

describe('SelectionSheetsAssignmentComponent', () => {
  let component: SelectionSheetsAssignmentComponent;
  let fixture: ComponentFixture<SelectionSheetsAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectionSheetsAssignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionSheetsAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
