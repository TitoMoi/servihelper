import { AfterViewInit, Component, OnInit, inject } from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { icon, Map, TileLayer, Polygon, Marker, LatLngTuple } from "leaflet";
import { Subscription, fromEvent } from "rxjs";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ReactiveFormsModule, Validators, UntypedFormBuilder } from "@angular/forms";
import { MapInterface, PolygonInterface } from "../model/map.model";
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
})
export class CreateUpdateMapComponent implements OnInit, AfterViewInit {
  private untypedFormBuilder = inject(UntypedFormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private mapService = inject(MapService);
  private polygonService = inject(PolygonService);

  loadedMap = this.mapService.getMap(this.activatedRoute.snapshot.params.id);
  loadedPolygon = this.polygonService.getPolygon(this.loadedMap?.poligonId);

  isUpdate = this.loadedMap ? true : false;

  mapForm = this.untypedFormBuilder.group({
    id: this.loadedMap ? this.loadedMap.id : undefined,
    name: [this.loadedMap ? this.loadedMap.name : undefined, Validators.required],
    poligonId: [this.loadedMap ? this.loadedMap.poligonId : undefined, Validators.required],
    initDateList: [this.loadedMap ? this.loadedMap.initDateList : undefined],
    endDateList: [this.loadedMap ? this.loadedMap.endDateList : undefined],
    m: [this.loadedMap ? this.loadedMap.m : undefined],
  });

  polygonForm = this.untypedFormBuilder.group({
    id: this.loadedMap ? this.loadedMap.id : undefined,
    latLngTupleList: this.loadedPolygon ? this.loadedPolygon.latLngTupleList : undefined,
  });

  subscription: Subscription = new Subscription();
  map: Map;

  markerRef: Marker[] = [];

  //User do clicks on map
  latLngTupleList: LatLngTuple[] = [];
  polygonRef: PolygonInterface;

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
        if (!this.polygonRef) {
          this.latLngTupleList.push(clickEvent.latlng);
          this.markerRef.push(new Marker(clickEvent.latlng).addTo(this.map));
        }
      })
    );
  }

  isCreatePolygonBtnDisabled() {
    return this.latLngTupleList.length < 2 || !!this.polygonRef === true;
  }

  createPolygon() {
    this.polygonRef = {
      id: "1", //just to allow the save button
      latLngTupleList: this.latLngTupleList,
      m: null,
    };
    this.leafletPolygon = new Polygon(this.polygonRef.latLngTupleList).addTo(this.map);
    this.mapForm.get("poligonId").setValue(this.polygonRef.id);
    this.polygonForm.get("latLngTupleList").setValue(this.polygonRef.latLngTupleList);
  }

  removePolygon() {
    this.latLngTupleList = [];
    this.polygonRef = undefined;
    this.leafletPolygon.remove();
    this.removeMarkers();
    this.mapForm.get("poligonId").reset();
    this.polygonForm.get("latLngTupleList").reset();
  }

  removeMarkers() {
    this.markerRef.forEach((m) => m.remove());
    this.markerRef = [];

    //Prevent create a polygon when no markers are visible
    if (!this.polygonRef) {
      this.latLngTupleList = [];
    }
  }

  //We need to save the polygon and the map
  save() {
    //Save polygon
    const polygon: PolygonInterface = this.polygonForm.value;
    const polygonId = this.polygonService.createPolygon(polygon);
    //Save the map
    const map: MapInterface = this.mapForm.value;
    map.poligonId = polygonId;
    this.mapService.createMap(map);

    //navigate to parent
    const route = this.isUpdate ? "../.." : "..";
    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }
}
