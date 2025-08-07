import { inject, Injectable } from '@angular/core';
import { ConfigService } from 'app/config/service/config.service';
import {
  MonthCodesType,
  S21FieldCodes,
  S21FieldCodesType,
  S21MonthCodesConst
} from 'app/globals/models/model';
import { ensureDirSync, readdir, readFileSync, remove, writeFile } from 'fs-extra';
import { PDFDocument } from 'pdf-lib';

import path from 'path';

@Injectable({
  providedIn: 'root'
})
export class S21Service {
  configService = inject(ConfigService);

  TotalHoursFieldCode = '904_32_S21_Value';

  async getPublisherRegistry(participantId: string): Promise<PDFDocument> {
    if (!participantId) {
      return Promise.resolve(null);
    }
    const buffer = readFileSync(await this.getPublisherRegistryFullPath(participantId));
    const pdf = await PDFDocument.load(this.toArrayBuffer(buffer));

    //Get field by name
    const form = pdf.getForm();
    console.log('Form fields:', form.acroForm.Fields());
    form.acroForm.Fields(); //Load fields

    return pdf;
  }

  async uploadPublisherRegistry(file: File, participantId: string) {
    //Given a non json pdf file, save it to source/assets/S21 folder and don't overwrite the pdf filename
    const filePath = await this.getPublisherRegistryFullPath(participantId, false, false);

    //Delete all files
    await remove(filePath);

    const arrayBuffer = new Uint8Array(await file.arrayBuffer());
    return writeFile(path.join(filePath, file.name), arrayBuffer);
  }

  async updatePublisherRegistry(pdf: PDFDocument, participantId: string): Promise<void> {
    const pdfSerialized = await pdf.save();
    const filePath = await this.getPublisherRegistryFullPath(participantId);
    return writeFile(filePath, pdfSerialized);
  }

  async getPublisherRegistryFullPath(
    participantId: string,
    onlyFileName = false,
    includeFileName = true
  ): Promise<string> {
    if (!participantId) {
      return null;
    }
    const dirPath = path.join(this.configService.sourceFilesPath, 'S21', participantId);
    ensureDirSync(dirPath);
    //Read file name from the filePath
    const files = await readdir(dirPath);

    if (!includeFileName) {
      return dirPath;
    }
    //Return the first file in the folder
    return onlyFileName ? files[0] : path.join(dirPath, files[0]);
  }

  toArrayBuffer(buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return arrayBuffer;
  }

  dateToMonthCode(month: number): MonthCodesType {
    switch (month) {
      case 0:
        return 'January';
      case 1:
        return 'February';
      case 2:
        return 'March';
      case 3:
        return 'April';
      case 4:
        return 'May';
      case 5:
        return 'June';
      case 6:
        return 'July';
      case 7:
        return 'August';
      case 8:
        return 'September';
      case 9:
        return 'October';
      case 10:
        return 'November';
      case 11:
        return 'December';
      default:
        throw new Error('Invalid month');
    }
  }

  setFieldValue(
    pdf: PDFDocument,
    month: MonthCodesType,
    fieldType: S21FieldCodesType,
    value: string | boolean
  ) {
    //Get the month field from the pdf
    const isCheckbox = S21FieldCodes[fieldType].includes('CheckBox');
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
      if (value) {
        const field = pdf
          .getForm()
          .getTextField(S21FieldCodes[fieldType].replace('XX', S21MonthCodesConst[month]));
        field.setText(value as string);
      }
    }
  }
}
