import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleImageAssignmentComponent } from './multiple-image-assignment.component';

describe('MultipleImageAssignmentComponent', () => {
  let component: MultipleImageAssignmentComponent;
  let fixture: ComponentFixture<MultipleImageAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultipleImageAssignmentComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleImageAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
