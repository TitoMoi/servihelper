import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TerritoryService } from "../service/territory.service";

@Component({
  selector: "app-massive-dates-territory",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./massive-dates-territory.component.html",
  styleUrls: ["./massive-dates-territory.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MassiveDatesTerritoryComponent {
  territories = this.territoryService.getTerritories();
  constructor(private territoryService: TerritoryService) {}
}
