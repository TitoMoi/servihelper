import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineTemplateComponent } from './online-template.component';

describe('OnlineTemplateComponent', () => {
  let component: OnlineTemplateComponent;
  let fixture: ComponentFixture<OnlineTemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OnlineTemplateComponent]
    });
    fixture = TestBed.createComponent(OnlineTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
