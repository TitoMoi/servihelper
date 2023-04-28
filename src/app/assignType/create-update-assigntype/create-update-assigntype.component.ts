import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ParticipantService } from "app/participant/service/participant.service";

import { ChangeDetectionStrategy, Component } from "@angular/core";
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { AutoFocusDirective } from "../../autofocus/autofocus.directive";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule } from "@ngneat/transloco";

@Component({
  selector: "app-create-update-assign-type",
  templateUrl: "./create-update-assigntype.component.html",
  styleUrls: ["./create-update-assigntype.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    AutoFocusDirective,
    MatCheckboxModule,
    MatButtonModule,
    RouterLink,
  ],
})
export class CreateUpdateAssignTypeComponent {
  at = this.assignTypeService.getAssignType(this.activatedRoute.snapshot.params.id);

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
      this.participantService.addAssignType(id, this.form.get("hasAssistant").value);
    }
    const route = this.isUpdate ? "../.." : "..";

    //navigate to parent
    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }
}
