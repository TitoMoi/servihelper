import { Component } from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";

@Component({
  selector: "app-territory-group",
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    NgIf,
    NgFor,
    MatIconModule,
  ],
  templateUrl: "./territory-group.component.html",
  styleUrls: ["./territory-group.component.scss"],
})
export class TerritoryGroupComponent {}
