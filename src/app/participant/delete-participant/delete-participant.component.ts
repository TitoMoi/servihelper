import { AssignmentService } from "app/assignment/service/assignment.service";
import { ParticipantInterface } from "app/participant/model/participant.model";
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
  selector: "app-delete-participant",
  templateUrl: "./delete-participant.component.html",
  styleUrls: ["./delete-participant.component.css"],
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    NgIf,
    AsyncPipe,
    MatIconModule,
  ],
})
export class DeleteParticipantComponent {
  participant = this.participantService.getParticipant(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  participantForm = this.formBuilder.group({
    id: this.participant.id,
    name: [{ value: this.participant.name, disabled: true }, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private router: Router,
    private onlineService: OnlineService,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit(participant: ParticipantInterface): void {
    this.participantService.deleteParticipant(participant.id);

    this.assignmentService.deleteAssignmentsByParticipant(participant.id);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
