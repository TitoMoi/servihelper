import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ParticipantService } from "app/participant/service/participant.service";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";

@Component({
  selector: "app-create-assign-type",
  templateUrl: "./create-assigntype.component.html",
  styleUrls: ["./create-assigntype.component.css"],
})
export class CreateAssignTypeComponent {
  assignTypeForm = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
    order: [undefined, Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit(): void {
    //save the assign type
    const id = this.assignTypeService.createAssignType(
      this.assignTypeForm.value
    );

    //Add the assign type reference for all the participants
    this.participantService.addAssignType(id);

    //navigate to parent
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }
}
