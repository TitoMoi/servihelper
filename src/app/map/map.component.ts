import { Component } from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { MapService } from "./services/map.service";
import { MapContextInterface } from "./model/map.model";

@Component({
  selector: "app-map",
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
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent {
  //In memory maps
  maps: MapContextInterface[] = this.mapService.getMaps();

  constructor(private mapService: MapService) {}
}
