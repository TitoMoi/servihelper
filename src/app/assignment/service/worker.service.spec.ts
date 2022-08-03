import { TestBed } from "@angular/core/testing";

import { AssignmentWorkerService } from "./worker.service";

describe("WorkerService", () => {
  let service: AssignmentWorkerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignmentWorkerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
