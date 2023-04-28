import { TestBed } from "@angular/core/testing";

import { LastDateService } from "./last-date.service";

describe("LastDateService", () => {
  let service: LastDateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LastDateService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
