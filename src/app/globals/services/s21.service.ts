import { inject, Injectable } from '@angular/core';
import { ConfigService } from 'app/config/service/config.service';
import {
  MonthCodesType,
  S21FieldCodes,
  S21FieldCodesType,
  S21MonthCodesConst
} from 'app/globals/models/model';
import { ensureDirSync, readdir, readFileSync, writeFile } from 'fs-extra';
import { PDFDocument } from 'pdf-lib';

@Injectable({
  providedIn: 'root'
})
export class S21Service {
  configService = inject(ConfigService);

  TotalHoursFieldCode = '904_32_S21_Value';

  async loadPublisherRegistry(participantId: string): Promise<PDFDocument> {
    const buffer = await this.getParticipantPublisherRegistry(participantId);

    const pdfDoc = await this.getPdfFromBuffer(buffer);
    //Get field by name
    const form = pdfDoc.getForm();
    form.acroForm.Fields(); //Load fields

    return pdfDoc;

    /* for (const field of fields.asArray()) {
      console.log('Field Name:', field);
    }
    console.log('AcroFormFields', fields);
    console.log('Fields', form.getFields());
    console.log('Field', form.getField('900_1_Text'));
    console.log('Field2', form.getField('900_2_Text_SanSerif')); */
  }

  getPdfFromBuffer(buffer: Buffer): Promise<PDFDocument> {
    return PDFDocument.load(this.toArrayBuffer(buffer));
  }

  async uploadPublisherRegistry(file: File, participantId: string) {
    //Given a non json pdf file, save it to source/assets/S21 folder and don't overwrite the pdf filename
    const filePath = `${this.configService.sourceFilesPath}/S21/${participantId}`;
    ensureDirSync(filePath);

    const arrayBuffer = new Uint8Array(await file.arrayBuffer());
    return writeFile(filePath + '/' + file.name, arrayBuffer);
  }

  async getParticipantPublisherRegistry(participantId: string): Promise<Buffer> {
    if (!participantId) {
      return Promise.resolve(null);
    }
    const filePath = `${this.configService.sourceFilesPath}/S21/${participantId}`;
    const files = await readdir(filePath);
    if (files.length === 0) {
      return null;
    }
    //If there are files, we assume the first one is the publisher registry
    return readFileSync(filePath + '/' + files[0]);
  }

  async getParticipantPublisherRegistryName(participantId: string) {
    if (!participantId) {
      return null;
    }
    const filePath = `${this.configService.sourceFilesPath}/S21/${participantId}`;
    ensureDirSync(filePath);
    //Read file name from the filePath
    const files = await readdir(filePath);
    if (files.length === 0) {
      return null;
    }
    //Return the first file in the folder
    return files[0];
  }

  toArrayBuffer(buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return arrayBuffer;
  }

  //The month must be the month number
  setFieldValue(
    pdf: PDFDocument,
    month: MonthCodesType,
    fieldType: S21FieldCodesType,
    value: string | boolean
  ) {
    //Get the month field from the pdf

    const isCheckbox = fieldType.endsWith('Checkbox');
    if (isCheckbox) {
      const checkField = pdf
        .getForm()
        .getCheckBox(S21FieldCodes[fieldType].replace('XX', S21MonthCodesConst[month]));
      if (value) {
        checkField.check();
      } else {
        checkField.uncheck();
      }
    } else {
      const field = pdf
        .getForm()
        .getTextField(S21FieldCodes[fieldType].replace('XX', S21MonthCodesConst[month]));
      field.setText(value.toString());
    }
  }
}
