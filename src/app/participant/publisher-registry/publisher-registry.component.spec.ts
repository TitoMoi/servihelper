import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublisherRegistryComponent } from './publisher-registry.component';

describe('PublisherRegistryComponent', () => {
  let component: PublisherRegistryComponent;
  let fixture: ComponentFixture<PublisherRegistryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublisherRegistryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublisherRegistryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
