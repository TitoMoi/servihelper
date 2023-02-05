import { AssignmentService } from "app/assignment/service/assignment.service";

import { Component } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-delete-assignment",
  templateUrl: "./delete-assignment.component.html",
  styleUrls: ["./delete-assignment.component.scss"],
})
export class DeleteAssignmentComponent {
  assignmentForm: UntypedFormGroup = this.formBuilder.group({
    id: this.activatedRoute.snapshot.params.id,
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private assignmentService: AssignmentService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit(): void {
    this.assignmentService.deleteAssignment(
      this.assignmentForm.get("id").value
    );

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
