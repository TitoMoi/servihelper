import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerritoryGroupDataComponent } from './territory-group-data.component';

describe('TerritoryGroupDataComponent', () => {
  let component: TerritoryGroupDataComponent;
  let fixture: ComponentFixture<TerritoryGroupDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerritoryGroupDataComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TerritoryGroupDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
