import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ParticipantService } from "app/participant/service/participant.service";

import { Component } from "@angular/core";
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule } from "@ngneat/transloco";
import { OnlineService } from "app/online/service/online.service";
import { AsyncPipe, NgIf } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-delete-assign-type",
  templateUrl: "./delete-assigntype.component.html",
  styleUrls: ["./delete-assigntype.component.css"],
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    AsyncPipe,
    NgIf,
    MatIconModule,
  ],
})
export class DeleteAssignTypeComponent {
  assignType = this.assignTypeService.getAssignType(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  assignTypeForm = this.formBuilder.group({
    id: this.assignType.id,
    name: [{ value: this.assignType.name, disabled: true }, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private router: Router,
    private onlineService: OnlineService,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit(): void {
    //get id
    const id = this.assignTypeForm.get("id").value;
    //delete the assignType
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
