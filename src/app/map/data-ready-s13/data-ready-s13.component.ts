import { Component, OnInit } from "@angular/core";
import { TerritoryService } from "../territory/service/territory.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { ParticipantPipe } from "app/participant/pipe/participant.pipe";
import { TranslocoDatePipe } from "@ngneat/transloco-locale";

@Component({
  selector: "app-data-ready-s13",
  standalone: true,
  imports: [ParticipantPipe, TranslocoDatePipe],
  templateUrl: "./data-ready-s13.component.html",
  styleUrl: "./data-ready-s13.component.scss",
})
export class DataReadyS13Component implements OnInit {
  chunkSize = 20;

  territoriesSource = this.territoryService.getTerritories().filter((t) => t.available);
  territoriesChunks = [];

  participants = this.participantService.getParticipants();

  constructor(
    private territoryService: TerritoryService,
    private participantService: ParticipantService,
  ) {}
  ngOnInit(): void {
    for (let i = 0; i < this.territoriesSource.length; i += this.chunkSize) {
      const chunk = this.territoriesSource.slice(i, i + this.chunkSize);
      this.territoriesChunks.push(chunk);
    }
  }
}
