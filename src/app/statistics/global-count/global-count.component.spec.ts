import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalCountComponent } from './global-count.component';

describe('GlobalCountComponent', () => {
  let component: GlobalCountComponent;
  let fixture: ComponentFixture<GlobalCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalCountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
