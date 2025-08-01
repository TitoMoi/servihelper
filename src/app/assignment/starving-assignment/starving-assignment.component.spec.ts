import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarvingAssignmentComponent } from './starving-assignment.component';

describe('StarvingAssignmentComponent', () => {
  let component: StarvingAssignmentComponent;
  let fixture: ComponentFixture<StarvingAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarvingAssignmentComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StarvingAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
