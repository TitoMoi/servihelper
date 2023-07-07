import { AfterViewInit, Component } from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import {icon, Map, TileLayer, Polygon, Marker} from "leaflet";
import { Subscription, fromEvent } from "rxjs";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: "app-create-update-map",
  standalone: true,
  imports: [CommonModule,
    TranslocoModule,
    MatButtonModule,
    NgIf,
    NgFor,
    MatIconModule,
  MatTooltipModule],
  templateUrl: "./create-update-map.component.html",
  styleUrls: ["./create-update-map.component.scss"],
})
export class CreateUpdateMapComponent implements AfterViewInit {

  subscription: Subscription = new Subscription();
  map: Map;

  markerRef: Marker[] = [];

  polygon = [];
  polygonRef:Polygon;

  ngAfterViewInit(): void {
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
Marker.prototype.options.icon = iconDefault;
    this.map = new Map("map").setView([51.505, -0.09], 13);

    new TileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        minZoom: 3,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(this.map);

      

  //https://leafletjs.com/reference.html#map-click
  this.subscription.add(fromEvent(this.map, 'click').subscribe((clickEvent: any) => {
    if(!this.polygonRef) {
      this.polygon.push(clickEvent.latlng);
      this.markerRef.push(new Marker(clickEvent.latlng).addTo(this.map));
    }
  }));
  }

  isCreatePolygonBtnDisabled() {
    return this.polygon.length < 2 || !!(this.polygonRef) === true
  }

  createPolygon() {
    this.polygonRef = new Polygon(this.polygon).addTo(this.map);
  }
  removePolygon(){
    this.polygonRef.remove();
    this.polygon = [];
    this.polygonRef = undefined;
    this.removeMarkers();
  }
  removeMarkers(){
    this.markerRef.forEach(m => m.remove());
    this.markerRef = [];

    //Prevent create a polygon when no markers are visible
    if(!this.polygonRef) {
      this.polygon = [];
    }
  }
}
