import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupDeleteAssignmentComponent } from './group-delete-assignment.component';

describe('GroupDeleteAssignmentComponent', () => {
  let component: GroupDeleteAssignmentComponent;
  let fixture: ComponentFixture<GroupDeleteAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupDeleteAssignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDeleteAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
