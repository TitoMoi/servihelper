import { ParticipantInterface } from 'app/participant/model/participant.model';
import { ParticipantService } from 'app/participant/service/participant.service';

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ConfigService } from 'app/config/service/config.service';
import { S21Service } from 'app/globals/services/s21.service';
import { SortService } from 'app/globals/services/sort.service';
import { OnlineService } from 'app/online/service/online.service';
import { Subscription } from 'rxjs';

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
export class ParticipantComponent implements OnInit {
  private participantService = inject(ParticipantService);
  private s21Service = inject(S21Service);
  private configService = inject(ConfigService);
  private sortService = inject(SortService);
  private onlineService = inject(OnlineService);

  participants: ParticipantInterface[] = this.participantService
    .getParticipants()
    .filter(participant => !participant.isExternal)
    .sort(this.sortService.sortByIsManAndByName);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  readonly isS21TemplateAvailable = signal(false);

  subscription = new Subscription();

  ngOnInit(): void {
    this.isS21TemplateAvailable.set(this.s21Service.isS21TemplateAvailable());

    this.subscription.add(
      this.configService.config$.subscribe(() =>
        this.isS21TemplateAvailable.set(this.s21Service.isS21TemplateAvailable())
      )
    );
  }

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
