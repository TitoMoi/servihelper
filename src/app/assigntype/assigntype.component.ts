import { AssignTypeInterface } from "app/assigntype/model/assigntype.model";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";

import { Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { AsyncPipe } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { TranslocoModule } from "@ngneat/transloco";
import { AssignTypeNamePipe } from "./pipe/assign-type-name.pipe";
import { OnlineService } from "app/online/service/online.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: "app-assign-type",
  templateUrl: "./assigntype.component.html",
  styleUrls: ["./assigntype.component.scss"],
  standalone: true,
  imports: [
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    AssignTypeNamePipe,
    MatTooltipModule,
    AsyncPipe,
  ],
})
export class AssignTypeComponent {
  //In memory assignTypes
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  participantsLength = this.participantService.getParticipantsLength();

  constructor(
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private onlineService: OnlineService
  ) {}
}
