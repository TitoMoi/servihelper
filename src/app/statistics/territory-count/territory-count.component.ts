import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { TerritoryService } from "app/map/territory/service/territory.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { ParticipantPipe } from "app/participant/pipe/participant.pipe";
import { ParticipantDynamicInterface } from "app/participant/model/participant.model";
import { SortService } from "app/services/sort.service";

@Component({
  selector: "app-territory-count",
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatIconModule,
    TranslocoLocaleModule,
    ParticipantPipe,
  ],
  templateUrl: "./territory-count.component.html",
  styleUrls: ["./territory-count.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerritoryCountComponent implements OnInit {
  territories = this.territoryService
    .getTerritories()
    .sort((a, b) => (a.name > b.name ? 1 : -1));

  participants: ParticipantDynamicInterface[] = this.participantService
    .getParticipants()
    .filter((participant) => !participant.isExternal);

  constructor(
    private territoryService: TerritoryService,
    private participantService: ParticipantService,
    private sortService: SortService
  ) {}
  ngOnInit(): void {
    for (let i = 0; i < this.participants.length; i++) {
      this.getTerritoryCount(this.participants[i]);
    }
    this.participants.sort(this.sortService.sortParticipantsByCount);
  }

  getTerritoryCount(p: ParticipantDynamicInterface): void {
    p.count = 0;
    for (let i = 0; i < this.territories.length; i++) {
      this.territories[i].participants.some((pId) => pId === p.id) ? p.count++ : "";
    }
  }
}