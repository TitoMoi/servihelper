import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class AssignmentWorkerService {
  constructor() {}

  async getData() {
    if (typeof Worker !== "undefined") {
      const worker = new Worker("../workers/assignment.worker", {
        type: "module",
      });

      worker.onmessage = ({ data }) => {
        console.log(`page got message: ${data}`);
      };

      worker.postMessage("hello");
    }
  }
}
