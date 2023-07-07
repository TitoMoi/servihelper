import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import leaflet from "leaflet";

@Component({
  selector: "app-create-update-map",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./create-update-map.component.html",
  styleUrls: ["./create-update-map.component.scss"],
})
export class CreateUpdateMapComponent implements OnInit {
  ngOnInit(): void {
    var map = leaflet.map("map").setView([51.505, -0.09], 13);

    leaflet
      .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(map);
  }
}
