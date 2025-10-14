import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { TranslocoLocaleService } from '@jsverse/transloco-locale';
import { S21Service } from 'app/globals/services/s21.service';
import { ParticipantPipe } from '../pipe/participant.pipe';
import { ParticipantService } from '../service/participant.service';

@Component({
  selector: 'app-publisher-registry-header',
  imports: [
    TranslocoModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatDatepickerModule,
    ParticipantPipe
  ],
  templateUrl: './publisher-registry-header.component.html',
  styleUrl: './publisher-registry-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublisherRegistryHeaderComponent implements OnInit {
  s21Service = inject(S21Service);
  fb = inject(FormBuilder);
  data: { participantId: string } = inject(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<PublisherRegistryHeaderComponent>);
  participantService = inject(ParticipantService);
  translocoService = inject(TranslocoService);
  translocoLocaleService = inject(TranslocoLocaleService);
  snackbar = inject(MatSnackBar);

  form = this.fb.group({
    name: ['', Validators.required],
    birthDate: [null],
    baptismDate: [null],
    men: [false],
    women: [false],
    otherSheeps: [false],
    anointed: [false],
    elder: [false],
    ministerialServant: [false],
    regularPioneer: [false],
    specialPioneer: [false],
    missionary: [false]
  });

  ngOnInit(): void {
    this.getParticipantHeaderRegistry();
  }

  async getParticipantHeaderRegistry() {
    const participant = this.participantService.getParticipant(this.data.participantId);
    const pdf = await this.s21Service.getPublisherRegistry(this.data.participantId);

    this.form.controls.name.setValue(
      (this.s21Service.getHeaderFieldValue(pdf, 'name') as string) || participant.name
    );

    const birthDateFormatedDate = this.s21Service.getFormatedDate(
      this.s21Service.getHeaderFieldValue(pdf, 'birthDate') as string
    );
    this.form.controls.birthDate.setValue(birthDateFormatedDate);
    const baptismFormatedDate = this.s21Service.getFormatedDate(
      this.s21Service.getHeaderFieldValue(pdf, 'baptismDate') as string
    );
    this.form.controls.baptismDate.setValue(baptismFormatedDate);

    const s21menHeaderValue = this.s21Service.getHeaderFieldValue(pdf, 'men');
    const s21womenHeaderValue = this.s21Service.getHeaderFieldValue(pdf, 'women');
    const hasGender = s21menHeaderValue || s21womenHeaderValue;
    if (!hasGender) {
      if (participant.isWoman) {
        this.form.controls.women.setValue(true);
      } else {
        this.form.controls.men.setValue(true);
      }
    } else {
      this.form.controls.men.setValue(s21menHeaderValue as boolean);
      this.form.controls.women.setValue(s21womenHeaderValue as boolean);
    }

    this.form.controls.otherSheeps.setValue(
      this.s21Service.getHeaderFieldValue(pdf, 'otherSheeps') as boolean
    );
    this.form.controls.anointed.setValue(
      this.s21Service.getHeaderFieldValue(pdf, 'anointed') as boolean
    );
    this.form.controls.elder.setValue(this.s21Service.getHeaderFieldValue(pdf, 'elder') as boolean);
    this.form.controls.ministerialServant.setValue(
      this.s21Service.getHeaderFieldValue(pdf, 'ministerialServant') as boolean
    );
    this.form.controls.regularPioneer.setValue(
      this.s21Service.getHeaderFieldValue(pdf, 'regularPioneer') as boolean
    );
    this.form.controls.specialPioneer.setValue(
      this.s21Service.getHeaderFieldValue(pdf, 'specialPioneer') as boolean
    );
    this.form.controls.missionary.setValue(
      this.s21Service.getHeaderFieldValue(pdf, 'missionary') as boolean
    );
  }

  async updatePublisherHeaderRegistry(): Promise<void> {
    const pdf = await this.s21Service.getPublisherRegistry(this.data.participantId);

    this.s21Service.setHeaderFieldValue(pdf, 'name', this.form.controls.name.value);
    if (
      this.form.controls.birthDate.value &&
      !isNaN(this.form.controls.birthDate.value.valueOf())
    ) {
      this.s21Service.setHeaderFieldValue(
        pdf,
        'birthDate',
        (this.form.controls.birthDate.value as Date).toLocaleDateString(
          this.translocoLocaleService.getLocale()
        )
      );
    }

    if (
      this.form.controls.baptismDate.value &&
      !isNaN(this.form.controls.baptismDate.value.valueOf())
    ) {
      this.s21Service.setHeaderFieldValue(
        pdf,
        'baptismDate',
        (this.form.controls.baptismDate.value as Date).toLocaleDateString(
          this.translocoLocaleService.getLocale()
        )
      );
    }
    this.s21Service.setHeaderFieldValue(pdf, 'men', this.form.controls.men.value);
    this.s21Service.setHeaderFieldValue(pdf, 'women', this.form.controls.women.value);
    this.s21Service.setHeaderFieldValue(pdf, 'otherSheeps', this.form.controls.otherSheeps.value);
    this.s21Service.setHeaderFieldValue(pdf, 'anointed', this.form.controls.anointed.value);
    this.s21Service.setHeaderFieldValue(pdf, 'elder', this.form.controls.elder.value);
    this.s21Service.setHeaderFieldValue(
      pdf,
      'ministerialServant',
      this.form.controls.ministerialServant.value
    );
    this.s21Service.setHeaderFieldValue(
      pdf,
      'regularPioneer',
      this.form.controls.regularPioneer.value
    );
    this.s21Service.setHeaderFieldValue(
      pdf,
      'specialPioneer',
      this.form.controls.specialPioneer.value
    );
    this.s21Service.setHeaderFieldValue(pdf, 'missionary', this.form.controls.missionary.value);

    await this.s21Service.updatePublisherRegistry(pdf, this.data.participantId);

    this.dialogRef.close(true);

    this.snackbar.open('Publisher header registry updated successfully', 'Close', {
      duration: 4000
    });
  }
}
