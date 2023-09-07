import { ParticipantInterface } from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";

import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatCheckboxChange, MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { NgIf, NgFor } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { TranslocoModule } from "@ngneat/transloco";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: "app-participant",
  templateUrl: "./participant.component.html",
  styleUrls: ["./participant.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    NgIf,
    MatCheckboxModule,
    NgFor,
    MatIconModule,
    MatTooltipModule,
  ],
})
export class ParticipantComponent {
  participants: ParticipantInterface[] = this.participantService
    .getParticipants()
    .filter((participant) => !participant.isExternal);

  constructor(private participantService: ParticipantService) {}

  toggleExternals(event: MatCheckboxChange) {
    if (event.checked) {
      this.participants = this.participantService
        .getParticipants()
        .filter((participant) => participant.isExternal);
    } else {
      this.participants = this.participantService
        .getParticipants()
        .filter((participant) => !participant.isExternal);
    }
  }
}
