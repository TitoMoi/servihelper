import { ParticipantInterface } from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";

import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { MatCheckboxChange } from "@angular/material/checkbox";

@Component({
  selector: "app-participant",
  templateUrl: "./participant.component.html",
  styleUrls: ["./participant.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantComponent implements OnInit {
  participants: ParticipantInterface[];

  constructor(private participantService: ParticipantService) {}

  ngOnInit(): void {
    this.participants = this.participantService
      .getParticipants()
      .filter((participant) => !participant.isExternal);
  }

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
