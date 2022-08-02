import { AssignmentInterface } from 'app/assignment/model/assignment.model';
import { AssignmentService } from 'app/assignment/service/assignment.service';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: "app-delete-assignment",
  templateUrl: "./delete-assignment.component.html",
  styleUrls: ["./delete-assignment.component.css"],
})
export class DeleteAssignmentComponent {
  assignmentForm: FormGroup = this.formBuilder.group({
    id: this.activatedRoute.snapshot.params.id,
  });

  constructor(
    private formBuilder: FormBuilder,
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
