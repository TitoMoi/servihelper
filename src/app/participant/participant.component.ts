import { ParticipantInterface } from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";

import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatCheckboxChange, MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { AsyncPipe } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { TranslocoModule } from "@ngneat/transloco";
import { MatTooltipModule } from "@angular/material/tooltip";
import { OnlineService } from "app/online/service/online.service";
import { SortService } from "app/services/sort.service";

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
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    AsyncPipe,
  ],
})
export class ParticipantComponent {
  participants: ParticipantInterface[] = this.participantService
    .getParticipants()
    .filter((participant) => !participant.isExternal)
    .sort(this.sortService.sortByIsManAndByName);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  constructor(
    private participantService: ParticipantService,
    private sortService: SortService,
    private onlineService: OnlineService,
  ) {}

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
