/* eslint-disable complexity */
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { GraphicService } from "app/services/graphic.service";
import { Color, NgxChartsModule, ScaleType } from "@swimlane/ngx-charts";
import { TerritoryService } from "app/map/territory/service/territory.service";
import { TranslocoDirective, TranslocoService } from "@ngneat/transloco";
import { TerritoryGroupService } from "app/map/territory-group/service/territory-group.service";
import { TerritoryContextClass } from "app/map/model/map.model";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { TerritoryGroupDataComponent } from "app/statistics/territory-graphics/territory-group-data/territory-group-data.component";

@Component({
    selector: "app-territory-graphics",
    imports: [NgxChartsModule, MatExpansionModule, TranslocoDirective, MatDialogModule],
    templateUrl: "./territory-graphics.component.html",
    styleUrl: "./territory-graphics.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TerritoryGraphicsComponent {
  gradient = false;

  //colors
  redColor = this.graphicService.redColor;
  yellowColor = this.graphicService.yellowColor;
  blueColor = this.graphicService.blueColor;
  purpleColor = this.graphicService.purpleColor;

  colorScheme: Color = {
    name: "servihelper",
    group: ScaleType.Linear,
    selectable: false,
    domain: [this.purpleColor, this.blueColor, this.yellowColor, this.redColor],
  };

  neverAssigned = this.translocoService.translate("TERRITORY_GRAPHICS_NEVER_ASSIGNED");
  beingWorkedOrReturnedLess = this.translocoService.translate(
    "TERRITORY_GRAPHICS_BEING_WORKED_OR_RETURNED_LESS",
  );
  beingWorkedOrReturnedMore = this.translocoService.translate(
    "TERRITORY_GRAPHICS_BEING_WORKED_OR_RETURNED_MORE",
  );
  overdue = this.translocoService.translate("TERRITORY_GRAPHICS_OVERDUE");

  territories = this.territoryService.getTerritories();

  territoryGroups = this.territoryGroupService.getTerritoryGroups();

  constructor(
    private graphicService: GraphicService,
    private territoryService: TerritoryService,
    private territoryGroupService: TerritoryGroupService,
    private translocoService: TranslocoService,
    private matDialog: MatDialog,
  ) {}

  /**
   * Get all the territory values for the keys
   */
  getAllTerritories(tgId?: string) {
    // position 0 = neverAssigned
    // 1 =  beingWorkedOrReturnedLess4
    // 2 =  beingWorkedOrReturnedMore4
    // 3 =  overdue
    const data = [];

    //All territories or the ones that belong to the group
    let territoriesByGroup: TerritoryContextClass[] = [];

    if (tgId) {
      territoriesByGroup = this.territoryService.getTerritoriesByTerritoryGroupId(tgId);
    } else {
      territoriesByGroup = this.territories;
    }
    //Filter the not available
    territoriesByGroup = territoriesByGroup.filter((t) => t.available);

    //Prepare objects for data
    const neverWorked = {
      name: this.neverAssigned,
      value: 0,
    };
    const beingWorkedLess4 = {
      name: this.beingWorkedOrReturnedLess,
      value: 0,
    };
    const beingWorkedMore4 = {
      name: this.beingWorkedOrReturnedMore,
      value: 0,
    };
    const overdue = {
      name: this.overdue,
      value: 0,
    };

    // Assign based on status
    for (const t of territoriesByGroup) {
      if (this.territoryService.isNeverAssignedTerritory(t)) {
        neverWorked.value++;
        continue;
      }
      if (this.territoryService.isMoreThan4Months(t)) {
        beingWorkedMore4.value++;
        continue;
      }
      if (this.territoryService.isOverdueTerritory(t)) {
        overdue.value++;
        continue;
      }
      beingWorkedLess4.value++;
    }

    //Add to the chart the values
    data[0] = neverWorked;
    data[1] = beingWorkedLess4;
    data[2] = beingWorkedMore4;
    data[3] = overdue;

    return data;
  }

  showSelect(tgId?: string) {
    this.matDialog.open(TerritoryGroupDataComponent, {
      data: tgId,
    });
  }
}
