import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FakeAssignmentRouteComponent } from './fake-assignment-route.component';

describe('FakeAssignmentRouteComponent', () => {
  let component: FakeAssignmentRouteComponent;
  let fixture: ComponentFixture<FakeAssignmentRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FakeAssignmentRouteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FakeAssignmentRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
