import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFromParticipantComponent } from './create-from-participant.component';

describe('CreateFromParticipantComponent', () => {
  let component: CreateFromParticipantComponent;
  let fixture: ComponentFixture<CreateFromParticipantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateFromParticipantComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFromParticipantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
