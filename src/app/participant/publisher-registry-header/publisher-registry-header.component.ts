import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoLocaleService } from '@ngneat/transloco-locale';
import { S21Service } from 'app/globals/services/s21.service';

@Component({
  selector: 'app-publisher-registry-header',
  imports: [
    MatFormFieldModule,
    MatCheckboxModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatDatepickerModule
  ],
  templateUrl: './publisher-registry-header.component.html',
  styleUrl: './publisher-registry-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublisherRegistryHeaderComponent implements OnInit {
  s21Service = inject(S21Service);
  fb = inject(FormBuilder);
  data: { participantId: string } = inject(MAT_DIALOG_DATA);
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
    const pdf = await this.s21Service.getPublisherRegistry(this.data.participantId);

    this.form.controls.name.setValue(this.s21Service.getHeaderFieldValue(pdf, 'name') as string, {
      emitEvent: false
    });
    this.form.controls.birthDate.setValue(
      new Date(this.s21Service.getHeaderFieldValue(pdf, 'birthDate') as string),
      {
        emitEvent: false
      }
    );
    this.form.controls.baptismDate.setValue(
      new Date(this.s21Service.getHeaderFieldValue(pdf, 'baptismDate') as string),
      {
        emitEvent: false
      }
    );
    this.form.controls.men.setValue(this.s21Service.getHeaderFieldValue(pdf, 'men') as boolean, {
      emitEvent: false
    });
    this.form.controls.women.setValue(
      this.s21Service.getHeaderFieldValue(pdf, 'women') as boolean,
      {
        emitEvent: false
      }
    );
    this.form.controls.otherSheeps.setValue(
      this.s21Service.getHeaderFieldValue(pdf, 'otherSheeps') as boolean,
      {
        emitEvent: false
      }
    );
    this.form.controls.anointed.setValue(
      this.s21Service.getHeaderFieldValue(pdf, 'anointed') as boolean,
      {
        emitEvent: false
      }
    );
    this.form.controls.elder.setValue(
      this.s21Service.getHeaderFieldValue(pdf, 'elder') as boolean,
      {
        emitEvent: false
      }
    );
    this.form.controls.ministerialServant.setValue(
      this.s21Service.getHeaderFieldValue(pdf, 'ministerialServant') as boolean,
      {
        emitEvent: false
      }
    );
    this.form.controls.regularPioneer.setValue(
      this.s21Service.getHeaderFieldValue(pdf, 'regularPioneer') as boolean,
      {
        emitEvent: false
      }
    );
    this.form.controls.specialPioneer.setValue(
      this.s21Service.getHeaderFieldValue(pdf, 'specialPioneer') as boolean,
      {
        emitEvent: false
      }
    );
    this.form.controls.missionary.setValue(
      this.s21Service.getHeaderFieldValue(pdf, 'missionary') as boolean
    );
  }

  async updatePublisherHeaderRegistry(): Promise<void> {
    const pdf = await this.s21Service.getPublisherRegistry(this.data.participantId);

    this.s21Service.setHeaderFieldValue(pdf, 'name', this.form.controls.name.value);
    this.s21Service.setHeaderFieldValue(
      pdf,
      'birthDate',
      this.translocoLocaleService.localizeDate(this.form.controls.birthDate.value as Date)
    );
    this.s21Service.setHeaderFieldValue(
      pdf,
      'baptismDate',
      this.translocoLocaleService.localizeDate(this.form.controls.baptismDate.value as Date)
    );
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

    this.s21Service.updatePublisherRegistry(pdf, this.data.participantId);

    this.snackbar.open('Publisher header registry updated successfully', 'Close', {
      duration: 4000
    });
  }
}
