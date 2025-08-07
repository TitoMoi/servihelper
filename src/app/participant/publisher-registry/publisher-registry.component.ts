import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoService } from '@ngneat/transloco';
import { GetMonthNamePipe } from 'app/globals/pipes/get-month-name.pipe';
import { S21Service } from 'app/globals/services/s21.service';
import { PDFDocument } from 'pdf-lib';
import { ParticipantService } from '../service/participant.service';

@Component({
  selector: 'app-publisher-registry',
  imports: [
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    GetMonthNamePipe,
    MatSelectModule
  ],
  templateUrl: './publisher-registry.component.html',
  styleUrl: './publisher-registry.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublisherRegistryComponent implements OnInit {
  participantsService = inject(ParticipantService);
  s21Service = inject(S21Service);
  translocoService = inject(TranslocoService);
  fb = inject(FormBuilder);

  participants = this.participantsService
    .getParticipants(true)
    .filter(p => p.available && p.hasPublisherR);

  months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(x => new Date(2000, x, 2));

  selectedMonth = new FormControl();

  lang = this.translocoService.getActiveLang();

  formGroupArray = this.participants.map(participant => {
    return this.fb.group({
      id: [participant.id],
      name: [participant.name],
      hasParticipated: [],
      hasBibleStudies: [],
      hours: [],
      notes: []
    });
  });

  ngOnInit(): void {
    this.loadPublisherRegistry('UDHU5rDPvq');
  }

  async loadPublisherRegistry(participantId: string): Promise<PDFDocument> {
    const buffer = await this.s21Service.getParticipantPublisherRegistry(participantId);
    return await this.s21Service.getPdfFromBuffer(buffer);
  }

  onMonthChange(e: Event) {}
}
