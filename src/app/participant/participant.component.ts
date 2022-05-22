import { Component, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
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

  icons: string[] = ["garbage", "edit"];

  constructor(
    private participantService: ParticipantService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    //Register icons
    for (const iconFileName of this.icons) {
      this.matIconRegistry.addSvgIcon(
        iconFileName,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          "assets/icons/" + iconFileName + ".svg"
        )
      );
    }
  }

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
