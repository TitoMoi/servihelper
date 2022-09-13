import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveAssignmentComponent } from './move-assignment.component';

describe('MoveAssignmentComponent', () => {
  let component: MoveAssignmentComponent;
  let fixture: ComponentFixture<MoveAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveAssignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
