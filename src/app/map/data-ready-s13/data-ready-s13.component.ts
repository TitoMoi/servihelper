import { Component } from "@angular/core";
import { TerritoryService } from "../territory/service/territory.service";
import { ParticipantService } from "app/participant/service/participant.service";

@Component({
  selector: "app-data-ready-s13",
  standalone: true,
  imports: [],
  templateUrl: "./data-ready-s13.component.html",
  styleUrl: "./data-ready-s13.component.scss",
})
export class DataReadyS13Component {
  territories = this.territoryService.getTerritories();
  participants = this.participantService.getParticipants();

  constructor(
    private territoryService: TerritoryService,
    private participantService: ParticipantService,
  ) {}
}
