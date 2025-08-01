import { TestBed } from '@angular/core/testing';

import { SheetTitleService } from './sheet-title.service';

describe('TitleServiceService', () => {
  let service: SheetTitleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SheetTitleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
