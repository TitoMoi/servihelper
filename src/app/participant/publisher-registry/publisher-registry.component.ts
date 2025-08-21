import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
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
import { Subscription } from 'rxjs';

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
export class PublisherRegistryComponent implements OnInit, OnDestroy {
  participantsService = inject(ParticipantService);
  s21Service = inject(S21Service);
  translocoService = inject(TranslocoService);
  snackbar = inject(MatSnackBar);
  dialog = inject(MatDialog);
  fb = inject(FormBuilder);

  participants = this.participantsService
    .getParticipants(true)
    .filter(p => p.available && !p.isExternal);

  readonly hasHeaderChanges = signal(false);

  readonly allActivePublishers = signal(0);

  readonly numberOfReports = signal(0);
  readonly numberOfBibleStudies = signal(0);

  readonly numberOfReportsAuxPioner = signal(0);
  readonly HoursAuxPioner = signal(0);
  readonly numberOfBibleStudiesAuxPioner = signal(0);

  readonly numberOfReportsRegularPioner = signal(0);
  readonly HoursRegularPioner = signal(0);
  readonly numberOfBibleStudiesRegularPioner = signal(0);

  months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(x => new Date(2000, x, 2));

  selectedMonth = new FormControl<number>(-1, Validators.required);

  lang = this.translocoService.getActiveLang();

  readonly assignmentsInFolderCreated = signal(false);
  showSpinner = false;

  subscription = new Subscription();

  formGroupArray = this.participants.map(participant => {
    const group = this.fb.group({
      id: [participant.id],
      name: [participant.name],
      hasParticipated: [null],
      bibleStudies: [null],
      isAuxPioner: [null],
      isRegPioner: [null],
      hours: [null],
      notes: [null]
    });

    this.subscription.add(
      group.controls.isAuxPioner.valueChanges.subscribe(isAuxPioner => {
        if (isAuxPioner) {
          group.controls.hours.enable();
        } else {
          group.controls.hours.disable();
        }
      })
    );

    this.subscription.add(
      group.valueChanges.subscribe(() => {
        const allActivePublishers = this.formGroupArray.filter(
          g => g.controls.hasParticipated.value
        );
        this.allActivePublishers.set(allActivePublishers.length);

        const publishers = allActivePublishers.filter(
          ap => !ap.controls.isAuxPioner.value && !ap.controls.isRegPioner.value
        );

        this.numberOfReports.set(publishers.length);
        this.numberOfBibleStudies.set(
          publishers.reduce((acc, p) => acc + Number(p.controls.bibleStudies.value), 0)
        );
        //
        const auxPioners = allActivePublishers.filter(ap => ap.controls.isAuxPioner.value);
        this.numberOfReportsAuxPioner.set(auxPioners.length);
        this.HoursAuxPioner.set(
          auxPioners.reduce((acc, p) => acc + Number(p.controls.hours.value), 0)
        );
        this.numberOfBibleStudiesAuxPioner.set(
          auxPioners.reduce((acc, p) => acc + Number(p.controls.bibleStudies.value), 0)
        );

        const regPioners = allActivePublishers.filter(ap => ap.controls.isRegPioner.value);
        this.numberOfReportsRegularPioner.set(regPioners.length);
        this.HoursRegularPioner.set(
          regPioners.reduce((acc, p) => acc + Number(p.controls.hours.value), 0)
        );
        this.numberOfBibleStudiesRegularPioner.set(
          regPioners.reduce((acc, p) => acc + Number(p.controls.bibleStudies.value), 0)
        );
      })
    );

    return group;
  });

  ngOnInit(): void {
    this.ensureAllParticipantsHavePublisherRegistry();

    this.subscription.add(
      this.selectedMonth.valueChanges.subscribe(month => {
        this.resetStatisticsFields();
        this.populateParticipantsData(month);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  resetStatisticsFields() {
    this.allActivePublishers.set(0);
    this.numberOfReports.set(0);
    this.numberOfBibleStudies.set(0);
    this.numberOfReportsAuxPioner.set(0);
    this.HoursAuxPioner.set(0);
    this.numberOfBibleStudiesAuxPioner.set(0);
    this.numberOfReportsRegularPioner.set(0);
    this.HoursRegularPioner.set(0);
    this.numberOfBibleStudiesRegularPioner.set(0);
  }

  async populateParticipantsData(month: number, participantId?: string) {
    for (const p of this.participants.filter(part => {
      return participantId ? part.id === participantId : true;
    })) {
      const pdfRegistry = await this.s21Service.getPublisherRegistry(p.id);
      const group = this.formGroupArray.find(g => g.controls.id.value === p.id);
      const monthName = this.s21Service.monthNumberToNameCode(month);

      group.reset(
        {
          id: group.controls.id.value,
          name: group.controls.name.value,
          hasParticipated: [null],
          bibleStudies: [null],
          isAuxPioner: [null],
          isRegPioner: [null],
          hours: [null],
          notes: [null]
        },
        { emitEvent: false }
      );

      group.controls.isRegPioner.setValue(
        this.s21Service.getHeaderFieldValue(pdfRegistry, 'regularPioneer') as boolean,
        { emitEvent: false }
      );
      group.controls.name.setValue(
        (this.s21Service.getHeaderFieldValue(pdfRegistry, 'name') as string) || p.name,
        { emitEvent: false }
      );
      group.controls.hasParticipated.setValue(
        this.s21Service.getFieldValue(pdfRegistry, monthName, 'hasParticipated'),
        { emitEvent: false }
      );
      group.controls.bibleStudies.setValue(
        this.s21Service.getFieldValue(pdfRegistry, monthName, 'bibleStudies'),
        { emitEvent: false }
      );

      //Check if is regular
      const isRegularPioner = this.s21Service.getHeaderFieldValue(pdfRegistry, 'regularPioneer');
      const isAuxPioner = this.s21Service.getFieldValue(pdfRegistry, monthName, 'isPioneer');
      if (isRegularPioner) {
        group.controls.isAuxPioner.setValue(false, { emitEvent: false });
        group.controls.isAuxPioner.disable({ emitEvent: false });
      } else {
        group.controls.isAuxPioner.enable({ emitEvent: false });
        group.controls.isAuxPioner.setValue(isAuxPioner, { emitEvent: false });
      }
      if (!isAuxPioner && !isRegularPioner) {
        group.controls.hours.disable({ emitEvent: false });
      } else {
        group.controls.hours.enable({ emitEvent: false });
      }
      group.controls.hours.setValue(
        this.s21Service.getFieldValue(pdfRegistry, monthName, 'hours'),
        { emitEvent: false }
      );
      group.controls.notes.setValue(this.s21Service.getFieldValue(pdfRegistry, monthName, 'notes'));
    }
    console.log('populated');
  }

  ensureAllParticipantsHavePublisherRegistry() {
    const promises = [];
    this.participants.forEach(async p => {
      promises.push(this.s21Service.preparePublisherRegistry(p.id));
    });
    Promise.all([...promises]).then(() => console.log('all files done'));
  }

  //Mark all participants as having participated but do not emit the value changes until the end
  markAllHaveParticipated() {
    this.formGroupArray.forEach(group => {
      group.controls.hasParticipated.setValue(true, { emitEvent: false });
    });
  }

  async updatePublisherRegistries(): Promise<void> {
    this.showSpinner = true;
    const promises = [];
    this.formGroupArray.forEach(async group => {
      const participantId = group.controls.id.value;
      const pdf = await this.s21Service.getPublisherRegistry(participantId);
      const monthCode = this.s21Service.monthNumberToNameCode(this.selectedMonth.value);

      this.s21Service.setFieldValue(
        pdf,
        monthCode,
        'hasParticipated',
        group.controls.hasParticipated.value
      );
      this.s21Service.setFieldValue(
        pdf,
        monthCode,
        'bibleStudies',
        group.controls.bibleStudies.value
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

  async exportPublisherRegistries() {
    this.assignmentsInFolderCreated.set(false);
    this.showSpinner = true;
    await this.s21Service.exportPublisherRegistry();
    this.snackbar.open('All publisher registries have been created');
    this.showSpinner = false;
    this.assignmentsInFolderCreated.set(true);
  }

  openS21RegistriesInFolder() {
    this.s21Service.openS21RegistriesInFolder();
  }

  openRegistryHeaderDetails(participantId: string): void {
    this.dialog
      .open(PublisherRegistryHeaderComponent, {
        width: '940px',
        height: '640px',
        data: { participantId }
      })
      .afterClosed()
      .subscribe(hasChanges => {
        if (hasChanges) {
          this.resetStatisticsFields();
          this.populateParticipantsData(this.selectedMonth.value, participantId);
        }
      });
  }
}
