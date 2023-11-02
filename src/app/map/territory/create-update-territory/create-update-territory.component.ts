import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import {
  icon,
  Map,
  TileLayer,
  Polygon,
  Marker,
  LeafletMouseEvent,
  LatLngLiteral,
  LatLng,
} from "leaflet";
import { Subscription, fromEvent } from "rxjs";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from "@angular/forms";
import { TerritoryService } from "../service/territory.service";
import { PolygonService } from "../service/polygon.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { AutoFocusDirective } from "app/directives/autofocus/autofocus.directive";
import { ConfigService } from "app/config/service/config.service";
import {
  PolygonInterface,
  TerritoryContextInterface,
  TerritoryGroupInterface,
} from "app/map/model/map.model";
import { ParticipantInterface } from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";
import { MatSelectChange, MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import { TerritoryGroupService } from "app/map/territory-group/service/territory-group.service";
import { ExportService } from "app/services/export.service";
import { OnlineService } from "app/online/service/online.service";

@Component({
  selector: "app-create-update-territory",
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
  templateUrl: "./create-update-territory.component.html",
  styleUrls: ["./create-update-territory.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateTerritoryComponent implements OnInit, AfterViewInit, OnDestroy {
  private formBuilder = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private territoryService = inject(TerritoryService);
  private territoryGroupService = inject(TerritoryGroupService);
  private polygonService = inject(PolygonService);
  private configService = inject(ConfigService);
  private cdr = inject(ChangeDetectorRef);
  private participantService = inject(ParticipantService);
  private exportService = inject(ExportService);
  private location = inject(Location);
  private onlineService = inject(OnlineService);

  loadedTerritory = this.territoryService.getTerritory(this.activatedRoute.snapshot.params.id);
  loadedPolygon = this.polygonService.getPolygon(this.loadedTerritory?.poligonId);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  isUpdate = this.loadedTerritory ? true : false;

  //TerritoryContextInterface
  mapForm = this.formBuilder.group({
    id: [this.loadedTerritory?.id],
    name: [this.loadedTerritory?.name, Validators.required],
    poligonId: [this.loadedTerritory?.poligonId],
    assignedDates: [this.loadedTerritory?.assignedDates || []],
    returnedDates: [this.loadedTerritory?.returnedDates || []],
    participants: [this.loadedTerritory?.participants || []],
    groups: [this.loadedTerritory?.groups || [], Validators.required],
    m: [this.loadedTerritory?.m], //modified is set again on create or update
  });

  //PolygonInterface
  polygonForm = this.formBuilder.group({
    id: [this.loadedPolygon?.id],
    latLngList: [this.loadedPolygon?.latLngList || []], //User do clicks on map
    m: [this.loadedPolygon?.m], //modified is set again on create or update
  });

  subscription: Subscription = new Subscription();

  //The leaflet map
  map: Map;
  //Tile
  tile: TileLayer;
  //Array of marker references
  markerRef: Marker[] = [];
  //Leaflet polygon
  leafletPolygon: Polygon;

  //OTHER DATA NOT RELATED TO THE MAP STRUCTURE
  participants: ParticipantInterface[] = this.participantService
    .getParticipants()
    .filter((p) => Boolean(p.isExternal) === false);
  territoryGroups: TerritoryGroupInterface[] = this.territoryGroupService.getTerritoryGroups();

  //Simulate a form control
  temporalParticipant;

  get selectedParticipant() {
    if (this.isTerritoryActive()) {
      return this.mapForm.controls.participants.value.at(-1);
    }
  }

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
    //Get center and destroy polygon
    let center: LatLng;
    if (this.polygonExists()) {
      const tempPolygon = new Polygon(this.polygonForm.controls.latLngList.value);
      center = tempPolygon.getBounds().getCenter();
      tempPolygon.remove();
    }

    //Its possible to create a territory without the polygon
    const viewPosition =
      this.isUpdate && this.polygonExists()
        ? this.polygonForm.controls.latLngList.value![0]
        : this.configService.getConfig().lastMapClick;
    const zoom = this.isUpdate ? 17 : 13;

    this.map = new Map("map2", { center, attributionControl: false }).setView(
      viewPosition,
      zoom
    );

    this.tile = new TileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      minZoom: 3,
    }).addTo(this.map);

    //Add polygon if exists
    if (this.polygonExists()) {
      this.createPolygon();
    }

    //You can get the type of the events using the on method
    /* this.map.on("click", (e: LeafletMouseEvent) => {
    }) */

    //https://leafletjs.com/reference.html#map-click
    this.subscription.add(
      fromEvent(this.map, "click").subscribe((clickEvent: LeafletMouseEvent) => {
        if (!this.polygonExists()) {
          const latLngListControl = this.polygonForm.controls.latLngList;
          const latLngList = latLngListControl.value;
          latLngList!.push(clickEvent.latlng);
          latLngListControl.patchValue(latLngList);
          this.createMarker(clickEvent.latlng);
          this.cdr.detectChanges();
        }
      })
    );

    //zoom the map to the polygon
    if (this.polygonExists()) {
      this.map.fitBounds(this.leafletPolygon.getBounds());
    }

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.markerRef.forEach((m) => m.remove());
    this.leafletPolygon?.remove();
    this.tile?.remove();
    this.map?.remove();
    this.subscription.unsubscribe();
  }

  goBack() {
    this.location.back();
  }

  /**
   *
   * @returns Check if is possible to create the polygon
   */
  isCreatePolygonBtnDisabled() {
    const latLngList = this.polygonForm.controls.latLngList.value;
    if (latLngList) {
      return latLngList.length < 2 || this.polygonExists();
    }
    return true;
  }

  /**
   * @param latLng the tuple object to add to the map
   * Store the reference in an array of refs.
   */
  createMarker(latLng: LatLngLiteral) {
    this.markerRef.push(new Marker(latLng).addTo(this.map));
  }

  /**
   *
   * @returns polygonExists if we have id
   */
  polygonExists() {
    return Boolean(this.polygonForm.controls.id.value);
  }

  createPolygon() {
    this.leafletPolygon = new Polygon(this.polygonForm.controls.latLngList.value).addTo(
      this.map
    );
    //Because on reset we remove the id and on update of the poligon the id should remain
    if (this.isUpdate && this.polygonExists()) {
      this.polygonForm.controls.id.setValue(this.loadedPolygon.id);
      return;
    }
    this.polygonForm.controls.id.setValue("1");
  }

  removePolygon() {
    this.polygonForm.controls.id.patchValue(null);
    this.polygonForm.controls.latLngList.patchValue([]);
    this.leafletPolygon.remove();
    this.removeMarkers();
    this.cdr.detectChanges();
  }

  removeMarkers() {
    this.markerRef.forEach((m) => m.remove());
    this.markerRef = [];
    //Remove the points in the polygon
    this.polygonForm.controls.latLngList.patchValue([]);
  }

  removeLastMarker() {
    this.markerRef.pop().remove();
    //Remove the last point in the polygon
    const latLngList = this.polygonForm.controls.latLngList.value;
    latLngList.pop();
    this.polygonForm.controls.latLngList.patchValue(latLngList);
  }

  /**
   * Save or update the territory, also update the last click point.
   * The polygon may exist.
   */
  save() {
    const polygon = this.polygonForm.value as PolygonInterface;
    //handle participant and save territory
    this.handleParticipant(this.temporalParticipant);
    const territory = this.mapForm.value as TerritoryContextInterface;
    if (this.isUpdate) {
      if (this.polygonExists()) {
        this.polygonService.updatePolygon(polygon);
      }
      this.territoryService.updateTerritory(territory);
    } else {
      if (this.polygonExists()) {
        const polygonId = this.polygonService.createPolygon(polygon);
        territory.poligonId = polygonId;
      }

      this.territoryService.createTerritory(territory);
    }
    if (this.polygonExists()) {
      this.configService.updateConfigByKey("lastMapClick", polygon.latLngList[0]);
    }
    //navigate to parent
    const route = this.isUpdate ? "../.." : "..";
    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }

  //OTHER METHODS NOT RELATED WITH MAPS

  /**
   * if participants length is greater than returnedDates it means the territory is active
   * else its not assigned or its returned
   */
  isTerritoryActive() {
    return (
      this.mapForm.controls.participants.value.length >
      this.mapForm.controls.returnedDates.value.length
    );
  }

  clearHistory() {
    this.mapForm.controls.participants.setValue([]);
    this.mapForm.controls.assignedDates.setValue([]);
    this.mapForm.controls.returnedDates.setValue([]);
    this.save();
  }

  onParticipantSelect(e: MatSelectChange) {
    this.temporalParticipant = e.value;
    this.cdr.detectChanges();
  }

  handleParticipant(participantId) {
    if (participantId) {
      if (!this.isUpdate) {
        this.mapForm.controls.participants.value.push(participantId);
        this.mapForm.controls.assignedDates.value.push(new Date());
      } else {
        /* update, we can already have a participant that has returned the territory
      he can be assigned again and it counts as a new assignment */
        //case territory is active but we need to change the participant
        if (this.isTerritoryActive()) {
          this.mapForm.controls.participants.value.pop();
          this.mapForm.controls.participants.value.push(participantId);
        } else {
          //Territory is returned and its not the first time as this case is !this.isUpdate
          this.mapForm.controls.participants.value.push(participantId);
          this.mapForm.controls.assignedDates.value.push(new Date());
        }
      }
    }
  }

  async toClipboard() {
    this.exportService.toClipboard("map2");
    this.cdr.detectChanges();
  }

  async toPng(mapName: string) {
    this.exportService.toPng("map2", mapName);
  }
}
