import { TestBed } from '@angular/core/testing';

import { TitleServiceService } from './title-service.service';

describe('TitleServiceService', () => {
  let service: TitleServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TitleServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
