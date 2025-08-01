import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoAssignmentComponent } from './info-assignment.component';

describe('InfoAssignmentComponent', () => {
  let component: InfoAssignmentComponent;
  let fixture: ComponentFixture<InfoAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoAssignmentComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InfoAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
