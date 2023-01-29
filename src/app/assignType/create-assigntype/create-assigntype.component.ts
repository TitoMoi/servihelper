import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ParticipantService } from "app/participant/service/participant.service";

import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-create-assign-type",
  templateUrl: "./create-assigntype.component.html",
  styleUrls: ["./create-assigntype.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAssignTypeComponent {
  assignTypeForm = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
    hasAssistant: [false],
    order: [undefined, Validators.required],
    color: ["#FFFFFF"],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit(): void {
    //save the assign type
    const id = this.assignTypeService.createAssignType({
      ...this.assignTypeForm.value,
    });

    //Add the assign type reference for all the participants
    this.participantService.addAssignType(
      id,
      this.assignTypeForm.get("hasAssistant").value
    );

    //navigate to parent
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }
}
