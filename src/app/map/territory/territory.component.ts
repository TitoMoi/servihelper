import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon, MatIconModule } from "@angular/material/icon";
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
import { OnlineService } from "app/online/service/online.service";

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerritoryComponent {
  territories: TerritoryContextInterface[] = this.territoryService
    .getTerritories()
    .sort((a, b) => (a.name > b.name ? 1 : -1));
  territoryGroups = this.territoryGroupService
    .getTerritoryGroups()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  constructor(
    private territoryService: TerritoryService,
    private territoryGroupService: TerritoryGroupService,
    private polygonService: PolygonService,
    private onlineService: OnlineService,
    private cdr: ChangeDetectorRef
  ) {}

  getLengthForGroup(tgId: string) {
    let count = 0;
    for (let i = 0; i < this.territories.length; i++) {
      if (this.territories[i].groups.includes(tgId)) count++;
    }
    return count;
  }

  generateMapLink(t: TerritoryContextInterface, matIcon: MatIcon) {
    matIcon.svgIcon = "clipboard";
    this.cdr.detectChanges();
    document.body.style.cursor = "wait";
    let servihelperMapUrl = new URL("https://titomoi.github.io/servihelper");
    servihelperMapUrl.searchParams.append(
      "polygon",
      JSON.stringify(this.polygonService.getPolygon(t.poligonId).latLngList)
    );
    clipboard.write(
      {
        text: servihelperMapUrl.toString(),
      },
      "selection"
    );
    document.body.style.cursor = "default";
    setTimeout(() => {
      matIcon.svgIcon = "maplink";
      this.cdr.detectChanges();
    }, 500);
  }
}
