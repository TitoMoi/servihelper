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
  ],
  templateUrl: "./territory.component.html",
  styleUrls: ["./territory.component.scss"],
})
export class TerritoryComponent {
  maps: TerritoryContextInterface[] = this.territoryService.getTerritories();
  territoryGroups = this.territoryGroupService
    .getTerritoryGroups()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  constructor(
    private territoryService: TerritoryService,
    private territoryGroupService: TerritoryGroupService
  ) {}
}
