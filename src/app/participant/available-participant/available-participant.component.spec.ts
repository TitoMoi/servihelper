import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableParticipantComponent } from './available-participant.component';

describe('AvailableParticipantComponent', () => {
  let component: AvailableParticipantComponent;
  let fixture: ComponentFixture<AvailableParticipantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AvailableParticipantComponent]
    });
    fixture = TestBed.createComponent(AvailableParticipantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
