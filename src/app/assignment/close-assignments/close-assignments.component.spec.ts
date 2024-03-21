import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseAssignmentsComponent } from './close-assignments.component';

describe('CloseAssignmentsComponent', () => {
  let component: CloseAssignmentsComponent;
  let fixture: ComponentFixture<CloseAssignmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloseAssignmentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CloseAssignmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
