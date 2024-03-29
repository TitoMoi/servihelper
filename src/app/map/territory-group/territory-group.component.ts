import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { TerritoryGroupInterface } from "../model/map.model";
import { TerritoryGroupService } from "./service/territory-group.service";
import { OnlineService } from "app/online/service/online.service";

@Component({
  selector: "app-territory-group",
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
  ],
  templateUrl: "./territory-group.component.html",
  styleUrls: ["./territory-group.component.scss"],
})
export class TerritoryGroupComponent {
  territoryGroups: TerritoryGroupInterface[] = this.territoryGroupService
    .getTerritoryGroups()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  constructor(
    private territoryGroupService: TerritoryGroupService,
    private onlineService: OnlineService,
  ) {}
}
