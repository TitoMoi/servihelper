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
import { ParticipantService } from 'app/participant/service/participant.service';
import { isDate } from 'date-fns';
import { shell } from 'electron';
import { filenamifyPath } from 'filenamify';
import {
  copy,
  copyFile,
  ensureDirSync,
  ensureFileSync,
  readdir,
  readFileSync,
  remove,
  removeSync,
  writeFile
} from 'fs-extra';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

@Injectable({
  providedIn: 'root'
})
export class S21Service {
  configService = inject(ConfigService);
  participantService = inject(ParticipantService);
  homeDir = this.configService.homeDir;

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

  isS21TemplateAvailable() {
    const lang = this.configService.getConfig().lang;
    switch (lang) {
      case 'en':
      case 'es':
      case 'ca':
        return true;
      default:
        return false;
    }
  }

  getS21TemplatePathByLang(onlyFileName = false) {
    const lang = this.configService.getConfig().lang;
    if (onlyFileName) {
      return `S-21_${lang}.pdf`;
    }
    return path.join(this.configService.templatesFilesPath, `S-21_${lang}.pdf`);
  }

  async preparePublisherRegistry(participantId: string) {
    const s21templatePath = this.getS21TemplatePathByLang();
    const filename = await this.getPublisherRegistryFullPath(participantId, true, false);
    if (!filename) {
      const dirPath = await this.getPublisherRegistryFullPath(participantId, false, false);
      return copy(s21templatePath, path.join(dirPath, this.getS21TemplatePathByLang(true)));
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
    const dirPath = path.join(this.configService.s21Path, participantId);
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

  async exportPublisherRegistry() {
    removeSync(filenamifyPath(path.join(this.homeDir, 'S21Reports')));

    const participants = this.participantService
      .getParticipants(true)
      .filter(p => p.available && !p.isExternal);

    const promises = [];
    for (const p of participants) {
      const pdf = await this.getPublisherRegistry(p.id);

      const isRegularPioner = this.getHeaderFieldValue(pdf, 'regularPioneer');
      const baptisedDate = this.getHeaderFieldValue(pdf, 'baptismDate');
      const publisherRegistryPathWithFileName = await this.getPublisherRegistryFullPath(
        p.id,
        false,
        true
      );
      if (isRegularPioner) {
        const fileName = filenamifyPath(
          path.join(this.homeDir, 'S21Reports', 'regularPioners', p.name + '.pdf')
        );
        ensureFileSync(fileName);
        promises.push(copyFile(publisherRegistryPathWithFileName, fileName));
      }

      if (isDate(baptisedDate)) {
        const fileName = filenamifyPath(
          path.join(this.homeDir, 'S21Reports', 'publishers', p.name + '.pdf')
        );
        ensureFileSync(fileName);
        promises.push(copyFile(publisherRegistryPathWithFileName, fileName));
      }
      if (!isDate(baptisedDate)) {
        const fileName = filenamifyPath(
          path.join(this.homeDir, 'S21Reports', 'not-baptised', p.name + '.pdf')
        );
        ensureFileSync(fileName);
        promises.push(copyFile(publisherRegistryPathWithFileName, fileName));
      }
    }
    return await Promise.all([...promises]);
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

  openS21RegistriesInFolder() {
    shell.openPath(path.join(this.homeDir, 'S21Reports'));
  }
}
