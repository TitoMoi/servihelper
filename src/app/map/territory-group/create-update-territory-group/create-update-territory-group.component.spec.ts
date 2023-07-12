import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateGroupMapComponent } from './create-update-group-map.component';

describe('CreateUpdateGroupMapComponent', () => {
  let component: CreateUpdateGroupMapComponent;
  let fixture: ComponentFixture<CreateUpdateGroupMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CreateUpdateGroupMapComponent]
    });
    fixture = TestBed.createComponent(CreateUpdateGroupMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
