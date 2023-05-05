import { TestBed } from "@angular/core/testing";

import { AssignTypeService } from "./assigntype.service";

describe("AssignTypeService", () => {
  let service: AssignTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignTypeService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
