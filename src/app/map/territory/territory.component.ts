import { Component } from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { TerritoryContextInterface } from "../model/map.model";
import { TerritoryService } from "./service/territory.service";

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
  ],
  templateUrl: "./territory.component.html",
  styleUrls: ["./territory.component.scss"],
})
export class TerritoryComponent {
  maps: TerritoryContextInterface[] = this.territoryService.getTerritories();

  constructor(private territoryService: TerritoryService) {}
}
