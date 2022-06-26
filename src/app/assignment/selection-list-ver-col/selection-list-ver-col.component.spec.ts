import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionListVerColComponent } from './selection-list-ver-col.component';

describe('SelectionListVerColComponent', () => {
  let component: SelectionListVerColComponent;
  let fixture: ComponentFixture<SelectionListVerColComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectionListVerColComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionListVerColComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
