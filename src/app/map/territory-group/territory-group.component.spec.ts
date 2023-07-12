import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerritoryGroupComponent } from './territory-group.component';

describe('TerritoryGroupComponent', () => {
  let component: TerritoryGroupComponent;
  let fixture: ComponentFixture<TerritoryGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TerritoryGroupComponent]
    });
    fixture = TestBed.createComponent(TerritoryGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
