import { TestBed } from '@angular/core/testing';

import { LockService } from './lock.service';

describe('LockService', () => {
  let service: LockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
