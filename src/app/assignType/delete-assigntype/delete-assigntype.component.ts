import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ParticipantService } from "app/participant/service/participant.service";

import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-delete-assign-type",
  templateUrl: "./delete-assigntype.component.html",
  styleUrls: ["./delete-assigntype.component.css"],
})
export class DeleteAssignTypeComponent {
  assignType = this.assignTypeService.getAssignType(
    this.activatedRoute.snapshot.params.id
  );

  assignTypeForm = this.formBuilder.group({
    id: this.assignType.id,
    name: [
      { value: this.assignType.name, disabled: true },
      Validators.required,
    ],
  });

  constructor(
    private formBuilder: FormBuilder,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit(): void {
    //get id
    const id = this.assignTypeForm.get("id").value;
    //save the assignType
    this.assignTypeService.deleteAssignType(id);
    //delete from participants assignType
    this.participantService.deleteAssignType(id);

    //delete all assignments that have the assignType
    this.assignmentService.deleteAssignmentsByAssignType(id);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
