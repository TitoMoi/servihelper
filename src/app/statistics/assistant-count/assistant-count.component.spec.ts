import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantCountComponent } from './assistant-count.component';

describe('AssistantCountComponent', () => {
  let component: AssistantCountComponent;
  let fixture: ComponentFixture<AssistantCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssistantCountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssistantCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
