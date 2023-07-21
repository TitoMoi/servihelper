import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterLink } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { AutoFocusDirective } from "app/autofocus/autofocus.directive";
import { PolygonService } from "../service/polygon.service";
import { Map, Polygon, TileLayer } from "leaflet";

@Component({
  selector: "app-heatmap",
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    NgIf,
    NgFor,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    AutoFocusDirective,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: "./heatmap.component.html",
  styleUrls: ["./heatmap.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatmapComponent implements AfterViewInit {
  polygonService = inject(PolygonService);
  private cdr = inject(ChangeDetectorRef);

  loadedPolygons = this.polygonService.getPolygons();

  //The leaflet map
  map: Map;

  ngAfterViewInit(): void {
    /* this.map = new Map("map").setView(this.loadedPolygons[0].latLngList[0], 16); */
    this.map = new Map("map").setView(
      { lat: 39.508560885931615, lng: -0.6224441528320312 },
      13
    );

    new TileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    this.createPolygons();

    this.cdr.detectChanges();
  }

  createPolygons() {
    for (let i = 0; i < this.loadedPolygons.length; i++) {
      new Polygon(this.loadedPolygons[i].latLngList).addTo(this.map);
    }
    this.cdr.detectChanges();
  }
}
