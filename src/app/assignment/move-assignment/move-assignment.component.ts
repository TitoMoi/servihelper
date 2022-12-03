import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AssignmentInterface } from "../model/assignment.model";
import { AssignmentService } from "../service/assignment.service";

@Component({
  selector: "app-move-assignment",
  templateUrl: "./move-assignment.component.html",
  styleUrls: ["./move-assignment.component.scss"],
})
export class MoveAssignmentComponent {
  assignments: AssignmentInterface[];

  assignmentsPromise = this.assignmentService
    .getAssignments()
    .then((assignments) => (this.assignments = assignments));

  form = this.formBuilder.group({
    originDate: [undefined, Validators.required],
    destinyDate: [undefined, Validators.required],
  });

  constructor(
    private assignmentService: AssignmentService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  submit() {
    const initialDate: Date = this.form.get("originDate").value;
    const destinyDate: Date = this.form.get("destinyDate").value;
    this.assignmentService.massiveDateChange(initialDate, destinyDate);

    //navigate to parent, one parent for each fragment
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }
}
