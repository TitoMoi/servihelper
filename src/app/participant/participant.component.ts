import {
  ParticipantInterface,
  ParticipantTableInterface,
} from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";

import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { MatLegacyCheckboxChange as MatCheckboxChange } from "@angular/material/legacy-checkbox";

@Component({
  selector: "app-participant",
  templateUrl: "./participant.component.html",
  styleUrls: ["./participant.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantComponent implements OnInit {
  participants: ParticipantInterface[];

  //Table
  displayedColumns: string[] = ["name", "editIcon", "deleteIcon"];

  dataSource: ParticipantTableInterface[];

  constructor(private participantService: ParticipantService) {}

  ngOnInit(): void {
    this.participants = this.participantService
      .getParticipants()
      .filter((participant) => !participant.isExternal);
    this.fillDataSource(this.participants);
  }

  trackByIdFn(index, participant: ParticipantTableInterface) {
    return participant.id;
  }

  toggleParticipants(event: MatCheckboxChange) {
    if (event.checked) {
      this.fillDataSource(
        this.participantService
          .getParticipants()
          .filter((participant) => participant.isExternal)
      );
    } else {
      this.fillDataSource(
        this.participantService
          .getParticipants()
          .filter((participant) => !participant.isExternal)
      );
    }
  }

  fillDataSource(participantsPage: ParticipantInterface[]) {
    const dataSourceTemp: ParticipantTableInterface[] = [];
    for (const participant of participantsPage) {
      //Populate datasource, values is in order
      dataSourceTemp.push({
        id: participant.id,
        name: participant.name,
      });
    }
    //Update the view
    this.dataSource = dataSourceTemp;
  }
}
