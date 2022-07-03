import { Component, OnInit } from "@angular/core";
import {
  ParticipantInterface,
  ParticipantTableInterface,
} from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";

@Component({
  selector: "app-participant",
  templateUrl: "./participant.component.html",
  styleUrls: ["./participant.component.scss"],
})
export class ParticipantComponent implements OnInit {
  participants: ParticipantInterface[];

  //Table
  displayedColumns: string[] = ["name", "editIcon", "deleteIcon"];

  dataSource: ParticipantTableInterface[];

  constructor(private participantService: ParticipantService) {}

  ngOnInit(): void {
    this.participants = this.participantService.getParticipants();
    this.fillDataSource(this.participants);
  }

  trackByIdFn(index, participant: ParticipantInterface) {
    return participant.id;
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
