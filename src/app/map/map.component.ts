import { Component } from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { MatRadioModule } from "@angular/material/radio";

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
    MatRadioModule,
    RouterOutlet,
  ],
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent {}
