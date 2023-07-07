import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateMapComponent } from './create-update-map.component';

describe('CreateUpdateMapComponent', () => {
  let component: CreateUpdateMapComponent;
  let fixture: ComponentFixture<CreateUpdateMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CreateUpdateMapComponent]
    });
    fixture = TestBed.createComponent(CreateUpdateMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
