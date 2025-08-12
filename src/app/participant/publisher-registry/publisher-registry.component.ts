import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@ngneat/transloco';
import { GetMonthNamePipe } from 'app/globals/pipes/get-month-name.pipe';
import { S21Service } from 'app/globals/services/s21.service';
import { PublisherRegistryHeaderComponent } from 'app/participant/publisher-registry-header/publisher-registry-header.component';
import { ParticipantService } from 'app/participant/service/participant.service';
@Component({
  selector: 'app-publisher-registry',
  imports: [
    MatCheckboxModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    GetMonthNamePipe,
    MatProgressSpinnerModule,
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
  snackbar = inject(MatSnackBar);
  dialog = inject(MatDialog);
  fb = inject(FormBuilder);

  participants = this.participantsService
    .getParticipants(true)
    .filter(p => p.available && !p.isExternal);

  months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(x => new Date(2000, x, 2));

  selectedMonth = new FormControl<number>(null, Validators.required);

  lang = this.translocoService.getActiveLang();

  showSpinner = false;

  formGroupArray = this.participants.map(participant => {
    return this.fb.group({
      id: [participant.id],
      name: [participant.name],
      hasParticipated: [null],
      hasBibleStudies: [null],
      isAuxPioner: [null],
      hours: [null],
      notes: [null]
    });
  });

  ngOnInit(): void {
    this.ensureAllParticipantsHavePublisherRegistry();
  }

  ensureAllParticipantsHavePublisherRegistry() {
    const promises = [];
    this.participants.forEach(async p => {
      promises.push(this.s21Service.preparePublisherRegistry(p.id));
    });
    Promise.all([...promises]).then(() => console.log('all files done'));
  }

  async updatePublisherRegistries(): Promise<void> {
    this.showSpinner = true;
    const promises = [];
    this.formGroupArray.forEach(async group => {
      const participantId = group.controls.id.value;
      const pdf = await this.s21Service.getPublisherRegistry(participantId);
      const monthCode = this.s21Service.dateToMonthCode(this.selectedMonth.value);

      this.s21Service.setFieldValue(
        pdf,
        monthCode,
        'hasParticipated',
        group.controls.hasParticipated.value
      );
      this.s21Service.setFieldValue(
        pdf,
        monthCode,
        'hasBibleStudies',
        group.controls.hasBibleStudies.value
      );
      this.s21Service.setFieldValue(pdf, monthCode, 'isPioneer', group.controls.isAuxPioner.value);
      this.s21Service.setFieldValue(pdf, monthCode, 'hours', group.controls.hours.value);
      this.s21Service.setFieldValue(pdf, monthCode, 'notes', group.controls.notes.value);
      promises.push(this.s21Service.updatePublisherRegistry(pdf, participantId));
    });
    await Promise.all([...promises]);
    this.showSpinner = false;
    this.snackbar.open('All Publisher registries updated successfully', 'Close', {
      duration: 3000
    });
  }

  onMonthChange($event: any) {
    return;
  }

  openRegistryHeaderDetails(participantId: string): void {
    this.dialog.open(PublisherRegistryHeaderComponent, {
      width: '940px',
      height: '640px',
      data: { participantId }
    });
  }
}
