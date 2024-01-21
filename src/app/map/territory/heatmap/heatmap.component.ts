import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Router, RouterLink } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { AutoFocusDirective } from "app/directives/autofocus/autofocus.directive";
import { ExportService } from "app/services/export.service";
import { PolygonService } from "../service/polygon.service";
import { Map, Polygon, TileLayer } from "leaflet";
import { TerritoryService } from "../service/territory.service";
import { TerritoryContextInterface } from "app/map/model/map.model";
import { differenceInMonths } from "date-fns";

@Component({
  selector: "app-heatmap",
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatButtonModule,
    RouterLink,
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
export class HeatmapComponent implements AfterViewInit, OnDestroy {
  polygonService = inject(PolygonService);
  private cdr = inject(ChangeDetectorRef);
  private territoryService = inject(TerritoryService);
  private exportService = inject(ExportService);
  private router = inject(Router);

  //Load only territories that have poligonId
  loadedTerritories = this.territoryService.getTerritories().filter((t) => t.poligonId) || [];
  loadedPolygons = this.polygonService.getPolygons() || [];

  //The leaflet map
  map: Map;
  //Tile
  tile: TileLayer;
  //PolygonRef list
  polygonRefList: Polygon[] = [];

  //colors
  redColor = "#fc6868";
  yellowColor = "#fafaa0";
  blueColor = "#92d4fc";
  greenColor = "#8afa84";

  ngAfterViewInit(): void {
    if (this.loadedPolygons.length) {
      this.map = new Map("map", { attributionControl: false }).setView(
        this.loadedPolygons[0].latLngList[0],
        13,
      );

      this.tile = new TileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        minZoom: 3,
      }).addTo(this.map);

      this.createPolygons();

      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    for (const p of this.polygonRefList) {
      p.remove();
    }
    this.tile?.remove();
    this.map?.off();
    this.map?.remove();
  }

  createPolygons() {
    for (let i = 0; i < this.loadedTerritories.length; i++) {
      const terr = this.loadedTerritories[i];
      const polygon = this.polygonService.getPolygon(terr.poligonId);
      const leafletPolygonRef = new Polygon(polygon.latLngList);
      this.polygonRefList.push(leafletPolygonRef);
      //bind the name and a callback method to open edit mode
      leafletPolygonRef.bindTooltip(terr.name);
      leafletPolygonRef.on("click", () => {
        const terr = this.territoryService.getTerritoryByPolygonId(polygon.id);
        this.router.navigate([`map/territory/update/${terr.id}`]);
      });
      const color = this.getColorBasedOnTimeDistance(terr);
      leafletPolygonRef.setStyle({ fillColor: color, color: color });
      leafletPolygonRef.addTo(this.map);
    }
    this.cdr.detectChanges();
  }

  getColorBasedOnTimeDistance(territory: TerritoryContextInterface): string {
    if (territory.assignedDates.length) {
      const territoryLastAssignedDate = new Date(territory.assignedDates.at(-1));
      if (territoryLastAssignedDate) {
        const distanceInMonths = differenceInMonths(territoryLastAssignedDate, new Date());
        /* how to reason the includes? https://date-fns.org/v2.30.0/docs/formatDistance#description */
        if (distanceInMonths >= 12) return this.redColor;
        if (distanceInMonths >= 4) return this.yellowColor;
      }
      return this.blueColor;
    }
    return this.greenColor;
  }

  /**
   * Copy image to the clipboard
   */
  async toClipboard() {
    this.exportService.toClipboard("map");
    this.cdr.detectChanges();
  }

  async toPng() {
    this.exportService.toPng("map", "heatmap");
  }
}
