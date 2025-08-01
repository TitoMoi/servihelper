/* eslint-disable complexity */
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TerritoryContextClass } from 'app/map/model/map.model';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';
import { TerritoryService } from 'app/map/territory/service/territory.service';
import { TerritoryGroupService } from 'app/map/territory-group/service/territory-group.service';
import { GraphicService } from 'app/services/graphic.service';

@Component({
  selector: 'app-territory-group-data',
  imports: [MatDialogModule, TranslocoDirective],
  templateUrl: './territory-group-data.component.html',
  styleUrl: './territory-group-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TerritoryGroupDataComponent implements OnInit {
  private tgId = inject(MAT_DIALOG_DATA);
  private territoryService = inject(TerritoryService);
  private territoryGroupService = inject(TerritoryGroupService);
  private graphicService = inject(GraphicService);
  private translocoService = inject(TranslocoService);

  neverAssigned = this.translocoService.translate('TERRITORY_GRAPHICS_NEVER_ASSIGNED');
  beingWorkedOrReturnedLess = this.translocoService.translate(
    'TERRITORY_GRAPHICS_BEING_WORKED_OR_RETURNED_LESS'
  );
  beingWorkedOrReturnedMore = this.translocoService.translate(
    'TERRITORY_GRAPHICS_BEING_WORKED_OR_RETURNED_MORE'
  );
  overdueTitle = this.translocoService.translate('TERRITORY_GRAPHICS_OVERDUE');

  territories = this.territoryService.getTerritories();

  territoryGroup = this.territoryGroupService.getTerritoryGroup(this.tgId);

  //colors
  redColor = this.graphicService.redColor;
  yellowColor = this.graphicService.yellowColor;
  blueColor = this.graphicService.blueColor;
  purpleColor = this.graphicService.purpleColor;

  //Prepare objects for data
  neverWorkedData: string[] = [];
  neverWorked = {
    name: this.neverAssigned,
    value: this.neverWorkedData
  };

  beingWorkedLess4Data: string[] = [];
  beingWorkedLess4 = {
    name: this.beingWorkedOrReturnedLess,
    value: this.beingWorkedLess4Data
  };

  beingWorkedMore4Data: string[] = [];
  beingWorkedMore4 = {
    name: this.beingWorkedOrReturnedMore,
    value: this.beingWorkedMore4Data
  };

  overdueData: string[] = [];
  overdue = {
    name: this.overdueTitle,
    value: this.overdueData
  };

  ngOnInit(): void {
    //All territories or the ones that belong to the group
    let territoriesByGroup: TerritoryContextClass[] = [];

    if (this.tgId) {
      territoriesByGroup = this.territoryService.getTerritoriesByTerritoryGroupId(this.tgId);
    } else {
      territoriesByGroup = this.territories;
    }
    //Filter the not available
    territoriesByGroup = territoriesByGroup.filter(t => t.available);

    // Assign based on status
    for (const t of territoriesByGroup) {
      if (this.territoryService.isNeverAssignedTerritory(t)) {
        this.neverWorked.value.push(t.name);
        continue;
      }
      if (this.territoryService.isMoreThan4Months(t)) {
        this.beingWorkedMore4.value.push(t.name);
        continue;
      }
      if (this.territoryService.isOverdueTerritory(t)) {
        this.overdue.value.push(t.name);
        continue;
      }
      this.beingWorkedLess4.value.push(t.name);
    }
  }

  getNeverAssignedBottomBorder() {
    return `4px solid ${this.purpleColor}`;
  }
  getLessThan4BottomBorder() {
    return `4px solid ${this.blueColor}`;
  }
  getMoreThan4BottomBorder() {
    return `4px solid ${this.yellowColor}`;
  }
  getOverdueBottomBorder() {
    return `4px solid ${this.redColor}`;
  }
}
