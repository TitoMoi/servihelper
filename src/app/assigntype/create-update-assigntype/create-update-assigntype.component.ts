import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ParticipantService } from "app/participant/service/participant.service";

import { ChangeDetectionStrategy, Component } from "@angular/core";
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { AutoFocusDirective } from "../../directives/autofocus/autofocus.directive";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule, TranslocoService } from "@ngneat/transloco";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AsyncPipe, CommonModule, NgIf } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { OnlineService } from "app/online/service/online.service";

@Component({
  selector: "app-create-update-assign-type",
  templateUrl: "./create-update-assigntype.component.html",
  styleUrls: ["./create-update-assigntype.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    AutoFocusDirective,
    MatCheckboxModule,
    MatButtonModule,
    MatTooltipModule,
    RouterLink,
    MatIconModule,
    AsyncPipe,
    NgIf,
  ],
})
export class CreateUpdateAssignTypeComponent {
  at = this.assignTypeService.getAssignType(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  isUpdate = this.at ? true : false;

  name = this.isUpdate
    ? this.at.name
      ? this.at.name
      : this.translocoService.translate(this.at.tKey)
    : null;

  form = this.formBuilder.group({
    id: this.at?.id,
    name: [this.name, Validators.required],
    hasAssistant: [this.at ? this.at.hasAssistant : false],
    repeat: [this.at ? this.at.repeat : false],
    type: [this.at ? this.at.type : "other"],
    order: [this.at?.order, Validators.required],
    color: [this.at ? this.at.color : "#FFFFFF"],
    days: [this.at?.days],
  });

  //Get an array of non repeated colors and remove falsy values
  colors = [
    ...new Set(
      this.assignTypeService
        .getAssignTypes()
        .map((at) => at.color)
        .filter((c) => !!c)
    ),
  ];
  showColors = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private router: Router,
    private translocoService: TranslocoService,
    private onlineService: OnlineService,
    private activatedRoute: ActivatedRoute
  ) {}

  isOtherAssignmentType() {
    return this.form.controls.type.value === "other";
  }

  getBgColor(c: string) {
    return `background-color: ${c}`;
  }

  onSubmit(): void {
    if (this.form.dirty) {
      if (this.isUpdate) {
        this.assignTypeService.updateAssignType({
          ...this.form.value,
        });
        //Update the assign type reference for all the participants if has assistant
        const id = this.form.get("id").value;
        this.participantService.massiveUpdateAssignType(
          id,
          this.form.get("hasAssistant").value
        );
      } else {
        //save the assign type
        const id = this.assignTypeService.createAssignType({
          ...this.form.value,
        });

        //Add the assign type reference for all the participants
        this.participantService.addAssignType(id, this.form.get("hasAssistant").value);
      }
    }

    const route = this.isUpdate ? "../.." : "..";

    //navigate to parent
    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }
}
