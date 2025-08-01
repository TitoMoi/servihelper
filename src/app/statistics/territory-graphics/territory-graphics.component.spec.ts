import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerritoryGraphicsComponent } from './territory-graphics.component';

describe('TerritoryGraphicsComponent', () => {
  let component: TerritoryGraphicsComponent;
  let fixture: ComponentFixture<TerritoryGraphicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerritoryGraphicsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TerritoryGraphicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
