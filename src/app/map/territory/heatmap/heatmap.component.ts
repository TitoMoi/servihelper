import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
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
import { Router, RouterLink } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { AutoFocusDirective } from "app/autofocus/autofocus.directive";
import { PolygonService } from "../service/polygon.service";
import { Map, Polygon, TileLayer } from "leaflet";
import { TerritoryService } from "../service/territory.service";
import { TerritoryContextInterface } from "app/map/model/map.model";
import { formatDistance } from "date-fns";
import { NativeImage, nativeImage, clipboard } from "electron";
import { toPng } from "html-to-image";

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
export class HeatmapComponent implements AfterViewInit, OnDestroy {
  polygonService = inject(PolygonService);
  private cdr = inject(ChangeDetectorRef);
  private territoryService = inject(TerritoryService);
  private router = inject(Router);

  loadedTerritories = this.territoryService.getTerritories();
  loadedPolygons = this.polygonService.getPolygons();

  //The leaflet map
  map: Map;
  //Tile
  tile: TileLayer;

  //colors
  redColor = "#fc6868";
  yellowColor = "#fafaa0";
  blueColor = "#92d4fc";
  greenColor = "#8afa84";

  ngAfterViewInit(): void {
    this.map = new Map("map").setView(this.loadedPolygons[0].latLngList[0], 13);

    this.tile = new TileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    this.createPolygons();

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.tile.remove();
    this.map.remove();
  }

  createPolygons() {
    for (let i = 0; i < this.loadedTerritories.length; i++) {
      const terr = this.loadedTerritories[i];
      const polygon = this.polygonService.getPolygon(terr.poligonId);
      const leafletPolygon = new Polygon(polygon.latLngList, {});
      //bind the name and a callback method to open edit mode
      leafletPolygon.bindTooltip(terr.name);
      leafletPolygon.on("click", () => {
        const terr = this.territoryService.getTerritoryByPolygonId(polygon.id);
        this.router.navigate([`map/territory/update/${terr.id}`]);
      });
      const color = this.getColorBasedOnTimeDistance(terr);
      leafletPolygon.setStyle({ fillColor: color, color: color });
      leafletPolygon.addTo(this.map);
    }
    this.cdr.detectChanges();
  }

  getColorBasedOnTimeDistance(territory: TerritoryContextInterface): string {
    if (territory.assignedDates.length) {
      const territoryLastAssignedDate = new Date(territory.assignedDates.at(-1));
      if (territoryLastAssignedDate) {
        const distance = formatDistance(territoryLastAssignedDate, new Date());
        /* how to reason the includes? https://date-fns.org/v2.30.0/docs/formatDistance#description */
        if (distance.includes("year")) return this.redColor;
        if (distance.includes("months")) return this.yellowColor;
      }
      return this.blueColor;
    }
    return this.greenColor;
  }

  /**
   * Copy image to the clipboard
   */
  async copyImageToClipboard() {
    document.body.style.cursor = "wait";
    const node = document.getElementById("map");
    const dataUrl = await toPng(node);
    const natImage: NativeImage = nativeImage.createFromDataURL(dataUrl);
    clipboard.write(
      {
        image: natImage,
      },
      "selection"
    );
    document.body.style.cursor = "default";
    this.cdr.detectChanges();
  }

  async toPng(mapName: string = "heatmap") {
    //the div
    document.body.style.cursor = "wait";
    const div = document.getElementById("map");
    const dataUrl = await toPng(div);

    const link = document.createElement("a");
    link.href = dataUrl;
    link.setAttribute("download", `${mapName}.png`);
    link.click();

    document.body.style.cursor = "default";
  }
}
