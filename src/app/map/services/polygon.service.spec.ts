import { TestBed } from '@angular/core/testing';

import { PolygonService } from './polygon.service';

describe('PolygonService', () => {
  let service: PolygonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolygonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
