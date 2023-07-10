import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { icon, Map, TileLayer, Polygon, Marker, LatLng } from "leaflet";
import { Subscription, fromEvent } from "rxjs";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ReactiveFormsModule, Validators, UntypedFormBuilder } from "@angular/forms";
import { MapContextInterface, PolygonInterface } from "../model/map.model";
import { MapService } from "../services/map.service";
import { PolygonService } from "../services/polygon.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { AutoFocusDirective } from "app/autofocus/autofocus.directive";

@Component({
  selector: "app-create-update-map",
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
  ],
  templateUrl: "./create-update-map.component.html",
  styleUrls: ["./create-update-map.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateMapComponent implements OnInit, AfterViewInit {
  private formBuilder = inject(UntypedFormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private mapService = inject(MapService);
  private polygonService = inject(PolygonService);
  private cdr = inject(ChangeDetectorRef);

  loadedMap: MapContextInterface = this.mapService.getMap(
    this.activatedRoute.snapshot.params.id
  );
  loadedPolygon = this.polygonService.getPolygon(this.loadedMap?.poligonId);

  isUpdate = this.loadedMap ? true : false;

  //MapContextInterface
  mapForm = this.formBuilder.group({
    id: this.loadedMap?.id,
    name: [this.loadedMap?.name, Validators.required],
    poligonId: [this.loadedMap?.poligonId, Validators.required],
    initDateList: [this.loadedMap?.initDateList],
    endDateList: [this.loadedMap?.endDateList],
    assignedToList: [this.loadedMap?.assignedToList],
    m: [this.loadedMap?.m],
  });

  //PolygonInterface
  polygonForm = this.formBuilder.group({
    id: this.loadedMap?.id,
    latLngList: this.loadedPolygon?.latLngList, //User do clicks on map
    m: this.loadedPolygon?.m,
  });

  subscription: Subscription = new Subscription();

  //The leaflet map
  map: Map;
  //Array of marker references
  markerRef: Marker[] = [];
  //Leaflet polygon
  leafletPolygon: Polygon;

  ngOnInit(): void {
    //Bug of leaflet fix
    const iconRetinaUrl = "assets/marker-icon-2x.png";
    const iconUrl = "assets/marker-icon.png";
    const shadowUrl = "assets/marker-shadow.png";
    const iconDefault = icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
    Marker.prototype.options.icon = iconDefault;
  }

  ngAfterViewInit(): void {
    this.map = new Map("map").setView([51.505, -0.09], 13);

    new TileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    //https://leafletjs.com/reference.html#map-click
    this.subscription.add(
      fromEvent(this.map, "click").subscribe((clickEvent: any) => {
        const polygonId = this.polygonForm.get("id")?.value;
        if (!polygonId) {
          const latLngListControl = this.polygonForm.get("latLngList");
          const latLngList = (latLngListControl.value as LatLng[]) || ([] as LatLng[]);
          latLngList.push(clickEvent.latlng);
          latLngListControl.patchValue(latLngList);
          this.createMarker(clickEvent.latlng);
          this.cdr.detectChanges();
        }
      })
    );
  }

  /**
   *
   * @returns Check if is possible to create the polygon
   */
  isCreatePolygonBtnDisabled() {
    const latLngList = this.polygonForm.get("latLngList").value as LatLng[];
    if (latLngList) {
      return latLngList.length < 2 || this.polygonExists();
    }
    return true;
  }

  /**
   * @param latLng the tuple object to add to the map
   * Store the reference in an array of refs.
   */
  createMarker(latLng: LatLng) {
    this.markerRef.push(new Marker(latLng).addTo(this.map));
  }

  polygonExists() {
    return Boolean(this.polygonForm.get("id").value);
  }

  createPolygon() {
    this.polygonForm.get("id").setValue("1");
    this.leafletPolygon = new Polygon(this.polygonForm.get("latLngList").value).addTo(
      this.map
    );
  }

  removePolygon() {
    this.polygonForm.get("id").reset();
    this.polygonForm.get("latLngList").reset();
    this.leafletPolygon.remove();
    this.removeMarkers();
  }

  removeMarkers() {
    this.markerRef.forEach((m) => m.remove());
    this.markerRef = [];
    //Remove the points in the polygon
    this.polygonForm.get("latLngList").reset();
  }

  //We need to save the polygon and the map
  save() {
    //Save polygon
    const polygon: PolygonInterface = this.polygonForm.value;
    const polygonId = this.polygonService.createPolygon(polygon);
    //Save the map
    const map: MapContextInterface = this.mapForm.value;
    map.poligonId = polygonId;
    this.mapService.createMap(map);

    //navigate to parent
    const route = this.isUpdate ? "../.." : "..";
    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }
}
