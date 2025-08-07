import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@ngneat/transloco';
import { TranslocoDatePipe } from '@ngneat/transloco-locale';
import { SortService } from 'app/globals/services/sort.service';
import { TerritoryService } from 'app/map/territory/service/territory.service';
import { ParticipantDynamicInterface } from 'app/participant/model/participant.model';
import { ParticipantPipe } from 'app/participant/pipe/participant.pipe';
import { ParticipantService } from 'app/participant/service/participant.service';

@Component({
  selector: 'app-territory-count',
  imports: [
    TranslocoDirective,
    MatExpansionModule,
    MatCheckboxModule,
    MatIconModule,
    TranslocoDatePipe,
    ParticipantPipe
  ],
  templateUrl: './territory-count.component.html',
  styleUrls: ['./territory-count.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TerritoryCountComponent implements OnInit {
  private territoryService = inject(TerritoryService);
  private participantService = inject(ParticipantService);
  private sortService = inject(SortService);

  territories = this.territoryService
    .getTerritories()
    .filter(t => t.available)
    .sort((a, b) => (a.name > b.name ? 1 : -1));

  participants: ParticipantDynamicInterface[] = this.participantService
    .getParticipants()
    .filter(participant => !participant.isExternal);

  //To show the table ordered by territory
  orderByTerritory = false;
  ngOnInit(): void {
    for (let i = 0; i < this.participants.length; i++) {
      this.getActiveTerritoryCount(this.participants[i]);
    }
    this.participants.sort(this.sortService.sortParticipantsByCount).reverse();
  }

  getActiveTerritoryCount(p: ParticipantDynamicInterface): void {
    p.count = 0;
    for (let i = 0; i < this.territories.length; i++) {
      this.territoryService.isActiveTerritory(this.territories[i]) &&
      this.territories[i].participants.at(-1) === p.id
        ? p.count++
        : '';
    }
  }
}
