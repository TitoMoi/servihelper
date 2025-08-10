import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublisherRegistryHeaderComponent } from './publisher-registry-header.component';

describe('PublisherRegistryHeaderComponent', () => {
  let component: PublisherRegistryHeaderComponent;
  let fixture: ComponentFixture<PublisherRegistryHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublisherRegistryHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublisherRegistryHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
