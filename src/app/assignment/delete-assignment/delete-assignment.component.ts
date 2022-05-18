import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";

@Component({
  selector: "app-delete-assignment",
  templateUrl: "./delete-assignment.component.html",
  styleUrls: ["./delete-assignment.component.css"],
})
export class DeleteAssignmentComponent implements OnInit {
  assignmentForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private assignmentService: AssignmentService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.assignmentForm = this.formBuilder.group({
      id: undefined,
    });

    this.activatedRoute.params.subscribe((params) => {
      this.assignmentForm.setValue({
        id: params.id,
      });
    });
  }

  onSubmit(assignment: AssignmentInterface): void {
    this.assignmentService.deleteAssignment(assignment.id);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
