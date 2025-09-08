import { Component, OnInit, inject } from '@angular/core';
import { TranslocoDatePipe, TranslocoLocaleService } from '@jsverse/transloco-locale';
import { ParticipantPipe } from 'app/participant/pipe/participant.pipe';
import { ParticipantService } from 'app/participant/service/participant.service';
import { TerritoryService } from '../territory/service/territory.service';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { WordService } from 'app/globals/services/word.service';
import { S13TerritoryEntry, TerritoryContextClass } from '../model/map.model';

@Component({
  selector: 'app-data-ready-s13',
  imports: [
    ReactiveFormsModule,
    ParticipantPipe,
    TranslocoDatePipe,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './data-ready-s13.component.html',
  styleUrl: './data-ready-s13.component.scss'
})
export class DataReadyS13Component implements OnInit {
  private territoryService = inject(TerritoryService);
  private participantService = inject(ParticipantService);
  private translocoLocaleService = inject(TranslocoLocaleService);
  private wordService = inject(WordService);

  chunkSize = 20;

  territoriesSource = this.territoryService.getTerritories().filter(t => t.available);
  territoriesChunks: TerritoryContextClass[][] = [];

  participants = this.participantService.getParticipants();

  serviceYearControl = new FormControl();
  ngOnInit(): void {
    for (let i = 0; i < this.territoriesSource.length; i += this.chunkSize) {
      const chunk = this.territoriesSource.slice(i, i + this.chunkSize);
      this.territoriesChunks.push(chunk);
    }
  }

  toS13Pdf() {
    const entries = this.getEntries();
    this.wordService.generateS13(this.serviceYearControl.value, entries);
  }

  getEntries() {
    const entries: S13TerritoryEntry[] = [];

    // eslint-disable-next-line complexity
    this.territoriesSource.forEach(t => {
      const lastCompletedDate = this.translocoLocaleService.localizeDate(
        t.returnedDates.at(-1) ??
          t.returnedDates.at(-2) ??
          t.returnedDates.at(-3) ??
          t.returnedDates.at(-4)
      );

      entries.push({
        terr_number: t.name,
        last_completed_date: lastCompletedDate,
        participant1: this.participantService.getParticipant(t.participants.at(-1))?.name || '',
        participant2: this.participantService.getParticipant(t.participants.at(-2))?.name || '',
        participant3: this.participantService.getParticipant(t.participants.at(-3))?.name || '',
        participant4: this.participantService.getParticipant(t.participants.at(-4))?.name || '',
        assigned1: this.translocoLocaleService.localizeDate(
          t.assignedDates[t.participants.length - 1]
        ),
        assigned2: this.translocoLocaleService.localizeDate(
          t.assignedDates[t.participants.length - 2]
        ),
        assigned3: this.translocoLocaleService.localizeDate(
          t.assignedDates[t.participants.length - 3]
        ),
        assigned4: this.translocoLocaleService.localizeDate(
          t.assignedDates[t.participants.length - 4]
        ),
        returned1: this.translocoLocaleService.localizeDate(
          t.returnedDates[t.participants.length - 1]
        ),
        returned2: this.translocoLocaleService.localizeDate(
          t.returnedDates[t.participants.length - 2]
        ),
        returned3: this.translocoLocaleService.localizeDate(
          t.returnedDates[t.participants.length - 3]
        ),
        returned4: this.translocoLocaleService.localizeDate(
          t.returnedDates[t.participants.length - 4]
        )
      });
    });
    return entries;
  }
}
