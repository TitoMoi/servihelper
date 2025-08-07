import { ParticipantInterface } from 'app/participant/model/participant.model';
import { ParticipantService } from 'app/participant/service/participant.service';

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { SortService } from 'app/globals/services/sort.service';
import { OnlineService } from 'app/online/service/online.service';

@Component({
  selector: 'app-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    AsyncPipe
  ]
})
export class ParticipantComponent {
  private participantService = inject(ParticipantService);
  private sortService = inject(SortService);
  private onlineService = inject(OnlineService);

  participants: ParticipantInterface[] = this.participantService
    .getParticipants()
    .filter(participant => !participant.isExternal)
    .sort(this.sortService.sortByIsManAndByName);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  toggleExternals(event: MatCheckboxChange) {
    if (event.checked) {
      this.participants = this.participantService
        .getParticipants()
        .filter(participant => participant.isExternal);
    } else {
      this.participants = this.participantService
        .getParticipants()
        .filter(participant => !participant.isExternal);
    }
  }
}
