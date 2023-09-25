import { Component } from "@angular/core";
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute, RouterLink } from "@angular/router";
import { ParticipantInterface } from "../model/participant.model";
import { ParticipantService } from "../service/participant.service";
import { MatButtonModule } from "@angular/material/button";
import { MatOptionModule } from "@angular/material/core";
import { NgFor, NgClass, AsyncPipe } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { AutoFocusDirective } from "../../directives/autofocus/autofocus.directive";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule } from "@ngneat/transloco";
import { OnlineService } from "app/online/service/online.service";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-create-from-participant",
  templateUrl: "./create-from-participant.component.html",
  styleUrls: ["./create-from-participant.component.scss"],
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    AutoFocusDirective,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    NgClass,
    MatButtonModule,
    RouterLink,
    AsyncPipe,
    MatIconModule,
  ],
})
export class CreateFromParticipantComponent {
  participants: ParticipantInterface[] = this.participantService.getParticipants(true);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  participantForm = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
    principal: [undefined, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private participantService: ParticipantService,
    private router: Router,
    private onlineService: OnlineService,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit(): void {
    const participantId = this.participantForm.get("principal").value;

    const participant: ParticipantInterface = structuredClone(
      this.participantService.getParticipant(participantId)
    );

    //Reset some properties
    participant.id = undefined;
    participant.notAvailableDates = [];

    //Add the name
    participant.name = this.participantForm.get("name").value;

    this.participantService.createParticipant(participant);

    //navigate to parent
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }
}
