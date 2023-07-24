import { Component } from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { TerritoryContextInterface } from "../model/map.model";
import { TerritoryService } from "./service/territory.service";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatExpansionModule } from "@angular/material/expansion";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { TerritoryGroupService } from "../territory-group/service/territory-group.service";
import { ParticipantPipe } from "app/participant/pipe/participant.pipe";
import { MatTooltipModule } from "@angular/material/tooltip";
import { PolygonService } from "./service/polygon.service";
import { clipboard } from "electron";

@Component({
  selector: "app-territory",
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    NgIf,
    NgFor,
    MatIconModule,
    MatExpansionModule,
    MatCheckboxModule,
    TranslocoLocaleModule,
    ParticipantPipe,
    MatTooltipModule,
  ],
  templateUrl: "./territory.component.html",
  styleUrls: ["./territory.component.scss"],
})
export class TerritoryComponent {
  territories: TerritoryContextInterface[] = this.territoryService
    .getTerritories()
    .sort((a, b) => (a.name > b.name ? 1 : -1));
  territoryGroups = this.territoryGroupService
    .getTerritoryGroups()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  constructor(
    private territoryService: TerritoryService,
    private territoryGroupService: TerritoryGroupService,
    private polygonService: PolygonService
  ) {}

  generateMapLink(t: TerritoryContextInterface) {
    document.body.style.cursor = "wait";
    let servihelperMapUrl = new URL("https://titomoi.github.io/servihelper");
    servihelperMapUrl.searchParams.append(
      "polygon",
      JSON.stringify(this.polygonService.getPolygon(t.poligonId).latLngList)
    );
    console.log(servihelperMapUrl.toString());
    clipboard.write(
      {
        text: servihelperMapUrl.toString(),
      },
      "selection"
    );
    document.body.style.cursor = "default";
  }
}
