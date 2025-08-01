import { TestBed } from '@angular/core/testing';

import { OnlineService } from './online.service';

describe('OnlineService', () => {
  let service: OnlineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnlineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
