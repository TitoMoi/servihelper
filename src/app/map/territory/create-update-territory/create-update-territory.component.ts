/* eslint-disable complexity */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
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
import { TranslocoModule, TranslocoService } from "@ngneat/transloco";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import {
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder,
  FormControl,
} from "@angular/forms";
import { TerritoryService } from "../service/territory.service";
import { PolygonService } from "../service/polygon.service";
import { TerrImageService } from "../service/terr-image.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInput, MatInputModule } from "@angular/material/input";
import { AutoFocusDirective } from "app/directives/autofocus/autofocus.directive";
import { ConfigService } from "app/config/service/config.service";
import {
  PolygonInterface,
  TerritoryContextClass,
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
import { NgOptimizedImage } from "@angular/common";
import { nanoid } from "nanoid";
import path from "path";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: "app-create-update-territory",
    imports: [
        CommonModule,
        NgOptimizedImage,
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
        MatCheckboxModule,
        MatOptionModule,
    ],
    templateUrl: "./create-update-territory.component.html",
    styleUrls: ["./create-update-territory.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateUpdateTerritoryComponent implements OnInit, AfterViewInit, OnDestroy {
  private formBuilder = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private territoryService = inject(TerritoryService);
  private territoryGroupService = inject(TerritoryGroupService);
  private polygonService = inject(PolygonService);
  private terrImageService = inject(TerrImageService);
  private configService = inject(ConfigService);
  private cdr = inject(ChangeDetectorRef);
  private participantService = inject(ParticipantService);
  private exportService = inject(ExportService);
  private location = inject(Location);
  private onlineService = inject(OnlineService);
  private matSnackBar = inject(MatSnackBar);
  private translocoService = inject(TranslocoService);

  loadedTerritory = this.territoryService.getTerritory(this.activatedRoute.snapshot.params.id);

  loadedPolygon = this.polygonService.getPolygon(this.loadedTerritory.poligonId);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  isUpdate = this.loadedTerritory.id ? true : false;

  //The path or the image when is loaded for the first time
  imagePath;

  @ViewChild("terrNameInput") terrNameInput: MatInput;

  //TerritoryContextInterface
  territoryForm = this.formBuilder.group({
    id: [this.loadedTerritory.id],
    name: new FormControl(this.loadedTerritory.name, { validators: Validators.required }),
    available: [this.loadedTerritory.available],
    poligonId: [this.loadedTerritory.poligonId],
    image: [], //Just a temporal base64 store until its saved to disk, its not part of the model
    imageId: [this.loadedTerritory.imageId],
    meetingPointUrl: [this.loadedTerritory.meetingPointUrl],
    assignedDates: [this.loadedTerritory.assignedDates],
    returnedDates: [this.loadedTerritory.returnedDates],
    participants: [this.loadedTerritory.participants],
    groups: [this.loadedTerritory.groups, Validators.required],
    m: [this.loadedTerritory.m], //modified is set again on create or update
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
    .filter((p) => Boolean(p.isExternal) === false && p.available);
  territoryGroups: TerritoryGroupInterface[] = this.territoryGroupService.getTerritoryGroups();

  //Simulate a form control
  temporalParticipant;

  //To mark if the persisted image should be removed on update
  shouldRemovePersistedImage = false;

  get selectedParticipant() {
    if (this.isTerritoryActive()) {
      return this.territoryForm.controls.participants.value.at(-1);
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

  /**
   * Initializes the map.
   */
  initMap() {
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
      zoom,
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
      }),
    );

    //zoom the map to the polygon
    if (this.polygonExists()) {
      this.map.fitBounds(this.leafletPolygon.getBounds());
    }

    this.cdr.detectChanges();
  }

  removeMap() {
    this.removePolygon(); //also removes markers
    this.tile?.remove();
    this.map?.off();
    this.map?.remove();
  }

  ngAfterViewInit(): void {
    this.initMap();

    if (!this.isUpdate) {
      this.territoryForm.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.removeMap();
    this.subscription.unsubscribe();
  }

  goBack() {
    // navigate back to heatmap or parent
    const prev = this.activatedRoute.snapshot.queryParams.prev;
    if (prev === "heatmap") {
      this.router.navigate(["map/territory/heatmap"]);
    } else {
      this.location.back();
    }
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
   * Generate a URL for the img src attr
   */
  uploadImageFile(event) {
    const files = event.target.files;

    if (files.length === 0) return;

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    //In case we delete an image and then upload a new one.
    this.shouldRemovePersistedImage = false;

    this.imagePath = files[0].path;

    const reader = new FileReader();
    reader.onload = () => {
      this.territoryForm.controls.image.setValue(reader.result);
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(files[0]);

    this.removePolygon(); //Also removes markers
  }

  getImagePath() {
    if (this.imageExists()) {
      return this.territoryForm.controls.image.value;
    }
    //Order matters, a territory may have no image so the persisted is last option
    if (this.imagePersisted()) {
      //Add a timestamp so the browser will think its different image and dont cache it
      const imgPath = `${path.join(
        this.configService.terrImagesPath,
        this.territoryForm.controls.imageId.value,
      )}?${nanoid(5)}`;
      return imgPath;
    }
    return null;
  }

  imageExists() {
    return Boolean(this.territoryForm.controls.image.value);
  }

  imagePersisted() {
    return Boolean(this.territoryForm.controls.imageId.value);
  }

  removeImage() {
    this.imagePath = null;

    this.territoryForm.controls.image.patchValue(null);

    if (this.territoryForm.controls.imageId.value) {
      this.shouldRemovePersistedImage = true;
      this.territoryForm.controls.imageId.patchValue(null);
    }

    //For some reason the map is not rendered as expected when the image is removed so we need this.
    setTimeout(() => this.map.invalidateSize(), 0);
  }

  /** @returns boolean polygonExists if we have id but its not persisted yet
   */
  polygonExists() {
    return Boolean(this.polygonForm.controls.id.value);
  }

  /** @returns boolean polygonExistsAndPersisted if we have id and its persisted
   */
  polygonExistsAndPersisted() {
    return (
      this.polygonExists() &&
      this.polygonService.getPolygon(this.polygonForm.controls.id.value)
    );
  }

  createPolygon() {
    this.leafletPolygon = new Polygon(this.polygonForm.controls.latLngList.value).addTo(
      this.map,
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
    this.leafletPolygon?.remove();
    this.removeMarkers();
    this.cdr.detectChanges();
  }

  removeMarkers() {
    for (const m of this.markerRef) {
      m.remove();
    }
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
  save(createAnother = false) {
    const polygon = this.polygonForm.value as PolygonInterface;
    //handle participant and save territory
    this.handleParticipant(this.temporalParticipant);

    const territory = new TerritoryContextClass(
      this.territoryForm.value as TerritoryContextInterface,
    );

    const image = this.territoryForm.controls.image.value;

    if (this.isUpdate) {
      //imagePath should be undefined if has value means a creation or an override
      if (this.imagePath) {
        //update image
        if (territory.imageId) {
          this.terrImageService.saveImage(this.imagePath, territory.imageId);
        } else {
          //create image
          const imageId = nanoid(this.configService.nanoMaxCharId);
          territory.imageId = imageId;
          this.terrImageService.saveImage(this.imagePath, imageId);
        }
        //if there is a image we should remove the polygon from the territory
        if (territory.poligonId) {
          this.polygonService.deletePolygon(territory.poligonId);
          territory.poligonId = null;
        }
      }

      if (this.shouldRemovePersistedImage) {
        this.terrImageService.deleteImage(this.loadedTerritory.imageId);
      }

      if (this.polygonExistsAndPersisted()) {
        this.polygonService.updatePolygon(polygon);
      }

      //Only exists in the UI this can happen as we can create a territory without polygon
      if (this.polygonExists()) {
        const polygonId = this.polygonService.createPolygon(polygon);
        territory.poligonId = polygonId;
      }
      this.territoryService.updateTerritory(territory);

      // navigate back to heatmap or parent
      const prev = this.activatedRoute.snapshot.queryParams.prev;
      if (prev === "heatmap") {
        this.router.navigate(["map/territory/heatmap"]);
      } else {
        this.location.back();
      }
    } else {
      //If image exists save or update it
      if (image) {
        const imageId = nanoid(this.configService.nanoMaxCharId);
        territory.imageId = imageId;
        this.terrImageService.saveImage(this.imagePath, imageId);
      }

      if (this.polygonExists()) {
        const polygonId = this.polygonService.createPolygon(polygon);
        territory.poligonId = polygonId;

        this.configService.updateConfigByKey("lastMapClick", polygon.latLngList[0]);
      }

      this.territoryService.createTerritory(territory);
      if (createAnother) {
        this.removePolygon();
        this.territoryForm.reset();
        this.polygonForm.reset({
          id: null,
          latLngList: [],
          m: null,
        });
        return;
      }
      // navigate back to heatmap or parent
      const prev = this.activatedRoute.snapshot.queryParams.prev;
      if (prev === "heatmap") {
        this.router.navigate(["map/territory/heatmap"]);
      } else {
        this.location.back();
      }
    }
  }

  //OTHER METHODS NOT RELATED WITH MAPS

  /**
   * if participants length is greater than returnedDates it means the territory is active
   * else its not assigned or its returned
   */
  isTerritoryActive() {
    return (
      this.territoryForm.controls.participants.value.length >
      this.territoryForm.controls.returnedDates.value.length
    );
  }

  clearHistory() {
    this.territoryForm.controls.participants.setValue([]);
    this.territoryForm.controls.assignedDates.setValue([]);
    this.territoryForm.controls.returnedDates.setValue([]);
    this.save();
  }

  onParticipantSelect(e: MatSelectChange) {
    this.temporalParticipant = e.value;
    this.cdr.detectChanges();
  }

  handleParticipant(participantId) {
    if (participantId) {
      if (!this.isUpdate) {
        this.territoryForm.controls.participants.value.push(participantId);
        this.territoryForm.controls.assignedDates.value.push(new Date());
      } else {
        /* update, we can already have a participant that has returned the territory
      he can be assigned again and it counts as a new assignment */
        //case territory is active but we need to change the participant
        if (this.isTerritoryActive()) {
          this.territoryForm.controls.participants.value.pop();
          this.territoryForm.controls.participants.value.push(participantId);
        } else {
          //Territory is returned and its not the first time as this case is !this.isUpdate
          this.territoryForm.controls.participants.value.push(participantId);
          this.territoryForm.controls.assignedDates.value.push(new Date());
        }
      }
    }
  }

  async toClipboard() {
    await this.exportService.toClipboard("map2");
    this.matSnackBar.open(
      this.translocoService.translate("COPIED"),
      this.translocoService.translate("CLOSE"),
      { duration: 3000, verticalPosition: "top" },
    );
    this.cdr.detectChanges();
  }

  async toPng(mapName: string) {
    await this.exportService.toPng("map2", mapName);
  }
}
