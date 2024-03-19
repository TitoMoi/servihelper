import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FakeAccordionComponent } from './fake-accordion.component';

describe('FakeAccordionComponent', () => {
  let component: FakeAccordionComponent;
  let fixture: ComponentFixture<FakeAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FakeAccordionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FakeAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
