import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataReadyS13Component } from './data-ready-s13.component';

describe('DataReadyS13Component', () => {
  let component: DataReadyS13Component;
  let fixture: ComponentFixture<DataReadyS13Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataReadyS13Component]
    }).compileComponents();

    fixture = TestBed.createComponent(DataReadyS13Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
