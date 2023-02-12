import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ParticipantService } from "app/participant/service/participant.service";

import { ChangeDetectionStrategy, Component } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-create-update-assign-type",
  templateUrl: "./create-update-assigntype.component.html",
  styleUrls: ["./create-update-assigntype.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateAssignTypeComponent {
  at = this.assignTypeService.getAssignType(
    this.activatedRoute.snapshot.params.id
  );

  isUpdate = this.at ? true : false;

  form = this.formBuilder.group({
    id: this.at ? this.at.id : undefined,
    name: [this.at ? this.at.name : undefined, Validators.required],
    hasAssistant: [this.at ? this.at.hasAssistant : false],
    order: [this.at ? this.at.order : undefined, Validators.required],
    color: [this.at ? this.at.color : "#FFFFFF"],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit(): void {
    if (this.isUpdate) {
      this.assignTypeService.updateAssignType({
        ...this.form.value,
      });
    } else {
      //save the assign type
      const id = this.assignTypeService.createAssignType({
        ...this.form.value,
      });

      //Add the assign type reference for all the participants
      this.participantService.addAssignType(
        id,
        this.form.get("hasAssistant").value
      );
    }
    const route = this.isUpdate ? "../.." : "..";

    //navigate to parent
    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }
}
