import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningAssignmentComponent } from './warning-assignment.component';

describe('WarningAssignmentComponent', () => {
  let component: WarningAssignmentComponent;
  let fixture: ComponentFixture<WarningAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarningAssignmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarningAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
