import { inject, Injectable } from '@angular/core';
import { ConfigService } from 'app/config/service/config.service';
import {
  MonthCodesType,
  S21FieldCodes,
  S21FieldCodesType,
  S21HeaderFieldCodes,
  S21HeaderFieldCodesType,
  S21MonthCodesConst
} from 'app/globals/models/model';
import { copy, ensureDirSync, readdir, readFileSync, remove, writeFile } from 'fs-extra';
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
    form.acroForm.Fields(); //Load fields

    return pdf;
  }

  async preparePublisherRegistry(participantId: string) {
    const s21templatePath = path.join(this.configService.templatesFilesPath, 'S-21_S.pdf');
    const filename = await this.getPublisherRegistryFullPath(participantId, true, false);
    if (!filename) {
      const dirPath = await this.getPublisherRegistryFullPath(participantId, false, false);
      return copy(s21templatePath, path.join(dirPath, 'S-21_S.pdf'));
    }
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

    if (onlyFileName) {
      return files[0];
    }

    if (!includeFileName) {
      return dirPath;
    } else {
      return path.join(dirPath, files[0]);
    }
  }

  toArrayBuffer(buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return arrayBuffer;
  }

  monthNumberToNameCode(month: number): MonthCodesType {
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

  getFieldValue(pdf: PDFDocument, month: MonthCodesType, fieldType: S21FieldCodesType) {
    //Get the month field from the pdf
    const isCheckbox = S21FieldCodes[fieldType].includes('CheckBox');
    if (isCheckbox) {
      const checkField = pdf
        .getForm()
        .getCheckBox(S21FieldCodes[fieldType].replace('XX', S21MonthCodesConst[month]));
      return checkField.isChecked();
    } else {
      const textField = pdf
        .getForm()
        .getTextField(S21FieldCodes[fieldType].replace('XX', S21MonthCodesConst[month]));
      return textField.getText();
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

  getHeaderFieldValue(pdf: PDFDocument, fieldType: S21HeaderFieldCodesType) {
    const isCheckbox = S21HeaderFieldCodes[fieldType].includes('CheckBox');
    if (isCheckbox) {
      const checkField = pdf.getForm().getCheckBox(S21HeaderFieldCodes[fieldType]);

      return checkField.isChecked();
    } else {
      const textField = pdf.getForm().getTextField(S21HeaderFieldCodes[fieldType]);
      return textField.getText();
    }
  }

  setHeaderFieldValue(
    pdf: PDFDocument,
    fieldType: S21HeaderFieldCodesType,
    value: string | boolean
  ) {
    //Get the header field from the pdf
    const isCheckbox = S21HeaderFieldCodes[fieldType].includes('CheckBox');
    if (isCheckbox) {
      const checkField = pdf.getForm().getCheckBox(S21HeaderFieldCodes[fieldType]);
      if (value) {
        checkField.check();
      } else {
        checkField.uncheck();
      }
    } else {
      if (value) {
        const field = pdf.getForm().getTextField(S21HeaderFieldCodes[fieldType]);
        field.setText(value as string);
      }
    }
  }
}
