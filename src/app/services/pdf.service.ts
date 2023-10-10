import { Injectable } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";
import { jsPDF, jsPDFOptions } from "jspdf";

import meiryo from "../../resources/base64fonts/meiryo";
import malgun from "../../resources/base64fonts/malgun";
import simsun from "../../resources/base64fonts/simsun";
import notosans from "../../resources/base64fonts/notosans";
import notosansbold from "../../resources/base64fonts/notosansbold";
import { PDFDocument } from "pdf-lib";
import path from "path";
import { ConfigService } from "app/config/service/config.service";
import { readFileSync } from "fs";
import { ParticipantService } from "app/participant/service/participant.service";
import { TranslocoLocaleService } from "@ngneat/transloco-locale";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { RoomService } from "app/room/service/room.service";
import { filenamifyPath } from "filenamify";
import { ensureFileSync, writeFile } from "fs-extra";

export type pdfFileNames = "S89" | "S89M";
@Injectable({
  providedIn: "root",
})
export class PdfService {
  jsPdf: jsPDF;

  langToFont = {
    ja: "meiryo",
    ko: "malgun",
    zhCN: "simsun",
  };

  font;

  lastFont;

  homeDir = this.configService.homeDir;

  //Pdf file names
  S89 = "S89.pdf";
  S89M = "S89M.pdf";

  //The default values that are in the pdf form
  defaultPdfFields1 = {
    principal: "900_1_Text",
    assistant: "900_2_Text",
    date: "900_3_Text",
    bibleReadingCheck: "900_4_CheckBox",
    initialCallCheck: "900_5_CheckBox",
    initialCallText: "900_6_Text",
    returnVisitCheck: "900_7_CheckBox",
    returnVisitText: "900_8_Text",
    bibleStudyCheck: "900_9_CheckBox",
    talkCheck: "900_10_CheckBox",
    otherCheck: "900_11_CheckBox",
    otherText: "900_12_Text",
    mainHallCheck: "900_13_CheckBox",
    auxiliaryHallCheck: "900_14_CheckBox",
    auxiliaryHall2Check: "900_15_CheckBox",
  };

  //The default values that are in the pdf form
  defaultPdfFields2 = {
    principal: "900_16_Text",
    assistant: "900_17_Text",
    date: "900_18_Text",
    bibleReadingCheck: "900_19_CheckBox",
    initialCallCheck: "900_20_CheckBox",
    initialCallText: "900_21_Text",
    returnVisitCheck: "900_22_CheckBox",
    returnVisitText: "900_23_Text",
    bibleStudyCheck: "900_24_CheckBox",
    talkCheck: "900_25_CheckBox",
    otherCheck: "900_26_CheckBox",
    otherText: "900_27_Text",
    mainHallCheck: "900_28_CheckBox",
    auxiliaryHallCheck: "900_29_CheckBox",
    auxiliaryHall2Check: "900_30_CheckBox",
  };

  //The default values that are in the pdf form
  defaultPdfFields3 = {
    principal: "900_31_Text",
    assistant: "900_32_Text",
    date: "900_33_Text",
    bibleReadingCheck: "900_34_CheckBox",
    initialCallCheck: "900_35_CheckBox",
    initialCallText: "900_36_Text",
    returnVisitCheck: "900_37_CheckBox",
    returnVisitText: "900_38_Text",
    bibleStudyCheck: "900_39_CheckBox",
    talkCheck: "900_40_CheckBox",
    otherCheck: "900_41_CheckBox",
    otherText: "900_42_Text",
    mainHallCheck: "900_43_CheckBox",
    auxiliaryHallCheck: "900_44_CheckBox",
    auxiliaryHall2Check: "900_45_CheckBox",
  };

  //The default values that are in the pdf form
  defaultPdfFields4 = {
    principal: "900_46_Text",
    assistant: "900_47_Text",
    date: "900_48_Text",
    bibleReadingCheck: "900_49_CheckBox",
    initialCallCheck: "900_50_CheckBox",
    initialCallText: "900_51_Text",
    returnVisitCheck: "900_52_CheckBox",
    returnVisitText: "900_53_Text",
    bibleStudyCheck: "900_54_CheckBox",
    talkCheck: "900_55_CheckBox",
    otherCheck: "900_56_CheckBox",
    otherText: "900_57_Text",
    mainHallCheck: "900_58_CheckBox",
    auxiliaryHallCheck: "900_59_CheckBox",
    auxiliaryHall2Check: "900_60_CheckBox",
  };

  constructor(
    private configService: ConfigService,
    private translocoService: TranslocoService,
    private translocoLocaleService: TranslocoLocaleService,
    private participantService: ParticipantService,
    private assignTypeService: AssignTypeService,
    private roomService: RoomService
  ) {}

  registerOnLangChange() {
    this.translocoService.langChanges$.subscribe((lang) => {
      this.font = this.langToFont[lang];
      if (!this.font) this.font = "notosans";
    });
  }

  /**
   *
   * @param disposition portrait or landscape
   */
  getJsPdf(jsPdfOptions: jsPDFOptions): jsPDF {
    this.jsPdf = new jsPDF(jsPdfOptions);

    if (this.font === "meiryo") {
      this.addJapaneseFont();
    }
    if (this.font === "malgun") {
      this.addKoreanFont();
    }
    if (this.font === "simsun") {
      this.addSimplifiedChineseFont();
    }
    if (this.font === "notosans") {
      this.addNotoSansFont();
    }

    return this.jsPdf;
  }

  addJapaneseFont() {
    //Japanese
    this.jsPdf.addFileToVFS("meiryo-normal.ttf", meiryo);
    this.jsPdf.addFont("meiryo-normal.ttf", "meiryo", "normal");
  }

  addKoreanFont() {
    //Korean
    this.jsPdf.addFileToVFS("malgun.ttf", malgun);
    this.jsPdf.addFont("malgun.ttf", "malgun", "normal");
  }

  addSimplifiedChineseFont() {
    //Simplified Chinese
    this.jsPdf.addFileToVFS("simsun.ttf", simsun);
    this.jsPdf.addFont("simsun.ttf", "simsun", "normal");
  }

  addNotoSansFont() {
    //Latin, Cyrilic
    this.jsPdf.addFileToVFS("notosans.ttf", notosans);
    this.jsPdf.addFont("notosans.ttf", "notosans", "normal");
    //Bold
    this.jsPdf.addFileToVFS("notosansbold.ttf", notosansbold);
    this.jsPdf.addFont("notosansbold.ttf", "notosans", "normal", 700);
  }

  /**
   *
   * @returns meiryo for japanese, malgun for korean, simsun for simplified chinese and noto sans for else.
   */
  getFontForLang() {
    return this.font;
  }

  /**
   *
   * @param name the name of the pdf template
   * @param optionalPath if provided it will look up for the filename in this path
   * @returns
   */
  checkTemplateExists(name: string) {
    if (this.S89 === name) {
      const availableTemplates = ["es", "en"];
      return availableTemplates.includes(this.configService.getConfig().lang);
    }
    return false;
  }

  /**
   *
   * @param name the name of the pdf template
   * @param optionalPath if provided it will look up for the filename in this path
   * @returns
   */
  async getPdfTemplateFile(name: string, optionalPath?: string) {
    const pdfFile = readFileSync(
      optionalPath
        ? optionalPath
        : path.join(
            this.configService.templatesFilesPath,
            this.configService.getConfig().lang,
            "pdf",
            name
          )
    );
    return await PDFDocument.load(pdfFile);
  }

  getWeekCounter(isWeekend: boolean) {
    return isWeekend ? 5 : 2;
  }

  getInitialHeight() {
    return 20;
  }

  getInitialWidth() {
    return 15;
  }

  getEndingWidth() {
    return 15;
  }

  getPageWidth() {
    return 210;
  }

  getDateFontSize() {
    return 14;
  }

  getTextFontSize() {
    return 11;
  }

  isAllowedTypeForS89(assignment: AssignmentInterface): boolean {
    const type = this.assignTypeService.getAssignType(assignment.assignType).type;
    return (
      type === "bibleReading" ||
      type === "initialCall" ||
      type === "returnVisit" ||
      type === "bibleStudy" ||
      type === "talk"
    );
  }

  addHeavyCheckImg(doc: jsPDF, x, y) {
    const image = path.join(this.configService.iconsFilesPath, "heavycheck.png");
    const uint8array = new Uint8Array(readFileSync(image));
    doc.addImage(uint8array, "PNG", x, y, 3, 3);
  }

  async toPdfS89Crafted(assignment: AssignmentInterface) {
    if (this.isAllowedTypeForS89(assignment)) {
      let doc = this.getJsPdf({
        orientation: "portrait",
        format: [113.03, 85.09],
        compress: true,
      });

      let x = 9;
      let y = 7;
      doc.setFont(this.font, "bold");
      doc.setFontSize(11.95);
      const text = doc.splitTextToSize(this.translocoService.translate("S89_TITLE"), 75);
      doc.text(text, x, y);

      x -= 5;
      y += 12;

      doc.setFont(this.font, "bold");
      doc.setFontSize(11.95);
      const s89Name = this.translocoService.translate("S89_NAME");
      let xPosForText = x + doc.getTextWidth(s89Name) + 2;
      doc.text(s89Name, x, y);
      doc.setFont(this.font, "normal");
      doc.setFontSize(8.76);
      doc.text(
        this.participantService.getParticipant(assignment.principal).name,
        xPosForText,
        y
      );

      y += 7;

      doc.setFont(this.font, "bold");
      doc.setFontSize(11.95);
      const s89Assistant = this.translocoService.translate("S89_ASSISTANT");
      xPosForText = x + doc.getTextWidth(s89Assistant) + 2;
      doc.text(s89Assistant, x, y);
      doc.setFont(this.font, "normal");
      doc.setFontSize(8.76);
      if (assignment.assistant)
        doc.text(
          this.participantService.getParticipant(assignment.assistant).name,
          xPosForText,
          y
        );

      y += 7;

      doc.setFont(this.font, "bold");
      doc.setFontSize(11.95);
      const s89Date = this.translocoService.translate("S89_DATE");
      xPosForText = x + doc.getTextWidth(s89Date) + 2;
      doc.text(s89Date, x, y);
      doc.setFont(this.font, "normal");
      doc.setFontSize(8.76);
      doc.text(
        this.translocoLocaleService.localizeDate(
          assignment.date,
          this.translocoLocaleService.getLocale(),
          { dateStyle: "full" }
        ),
        xPosForText,
        y
      );

      y += 8;

      doc.setFont(this.font, "bold");
      doc.setFontSize(8.76);
      doc.text(this.translocoService.translate("S89_ASSIGNMENT_TITLE"), x, y);

      doc.setFont(this.font, "normal");

      x += 5;
      y += 5;

      const type = this.assignTypeService.getAssignType(assignment.assignType).type;

      doc.rect(x, y - 2.5, 3, 3);
      if (type === "bibleReading") this.addHeavyCheckImg(doc, x, y - 2.5);
      doc.text(this.translocoService.translate("S89_BIBLEREADING"), x + 5, y);

      doc.rect(x + 45, y - 2.5, 3, 3);
      if (type === "bibleStudy") this.addHeavyCheckImg(doc, x, y - 2.5);
      doc.text(this.translocoService.translate("S89_BIBLESTUDY"), x + 50, y);

      y += 5;

      doc.rect(x, y - 2.5, 3, 3);
      if (type === "initialCall") this.addHeavyCheckImg(doc, x, y - 2.5);
      doc.text(this.translocoService.translate("S89_INITIALCALL"), x + 5, y);

      doc.rect(x + 45, y - 2.5, 3, 3);
      if (type === "talk") this.addHeavyCheckImg(doc, x, y - 2.5);
      doc.text(this.translocoService.translate("S89_TALK"), x + 50, y);

      y += 5;

      doc.rect(x, y - 2.5, 3, 3);
      if (type === "returnVisit") this.addHeavyCheckImg(doc, x, y - 2.5);
      doc.text(this.translocoService.translate("S89_RETURNVISIT"), x + 5, y);

      doc.rect(x + 45, y - 2.5, 3, 3);
      if (type === "other") this.addHeavyCheckImg(doc, x, y - 2.5);
      doc.text(this.translocoService.translate("S89_OTHER"), x + 50, y);

      y += 5;

      y += 7;
      x -= 5;

      doc.setFont(this.font, "bold");

      doc.text(this.translocoService.translate("S89_ROOMS_TITLE"), x, y);

      doc.setFont(this.font, "normal");

      x += 5;
      y += 5;

      const roomType = this.roomService.getRoom(assignment.room).type;

      doc.rect(x, y - 2.5, 3, 3);
      if (roomType === "mainHall") this.addHeavyCheckImg(doc, x, y - 2.5);
      doc.text(this.translocoService.translate("S89_MAINHALL"), x + 5, y);

      y += 5;

      doc.rect(x, y - 2.5, 3, 3);
      if (roomType === "auxiliaryRoom1") this.addHeavyCheckImg(doc, x, y - 2.5);
      doc.text(this.translocoService.translate("S89_AUXILIARYROOM1"), x + 5, y);

      y += 5;

      doc.rect(x, y - 2.5, 3, 3);
      if (roomType === "auxiliaryRoom2") this.addHeavyCheckImg(doc, x, y - 2.5);
      doc.text(this.translocoService.translate("S89_AUXILIARYROOM2"), x + 5, y);

      y += 7;
      x -= 5;

      doc.setFontSize(7.07);
      const footerText: string[] = doc.splitTextToSize(
        this.translocoService.translate("S89_FOOTERNOTE"),
        77
      );

      const startXCached = x;
      footerText.map((text, i) => {
        if (text) {
          const arrayOfNormalAndBoldText = text.split("*");
          arrayOfNormalAndBoldText.map((textItems, j) => {
            if (textItems.includes("[b]")) {
              textItems = textItems.replace("[b]", "");
              doc.setFont(this.font, "bold");
            } else {
              doc.setFont(this.font, "normal");
            }

            doc.text(textItems, x, y);
            x = x + doc.getTextWidth(textItems) + 1;
          });

          x = startXCached;
          y += 3.5;
        }
      });

      y += 5;

      doc.text(this.translocoService.translate("S89_VERSION"), x, y);
      doc.text(this.translocoService.translate("S89_DATE_VERSION"), x + 15, y);

      return doc.output("blob");
    }
  }
  /**
   *
   * @param assignment the assignment to S89
   * @returns the pdf array
   */
  async toPdfS89(assignment: AssignmentInterface): Promise<Uint8Array> {
    if (this.isAllowedTypeForS89(assignment)) {
      const pdfDoc = await this.getPdfTemplateFile(this.S89);
      let form = pdfDoc.getForm();

      //Get fields
      const principal = form.getTextField(this.defaultPdfFields1.principal);
      principal.setFontSize(10);
      const assistant = form.getTextField(this.defaultPdfFields1.assistant);
      assistant.setFontSize(10);
      const date = form.getTextField(this.defaultPdfFields1.date);
      date.setFontSize(10);
      const bibleReadingCheck = form.getCheckBox(this.defaultPdfFields1.bibleReadingCheck);
      const initialCallCheck = form.getCheckBox(this.defaultPdfFields1.initialCallCheck);
      const returnVisitCheck = form.getCheckBox(this.defaultPdfFields1.returnVisitCheck);
      const bibleStudyCheck = form.getCheckBox(this.defaultPdfFields1.bibleStudyCheck);
      const talkCheck = form.getCheckBox(this.defaultPdfFields1.talkCheck);
      const otherCheck = form.getCheckBox(this.defaultPdfFields1.otherCheck);
      const otherText = form.getTextField(this.defaultPdfFields1.otherText);
      const mainHallCheck = form.getCheckBox(this.defaultPdfFields1.mainHallCheck);
      const auxiliaryHallCheck = form.getCheckBox(this.defaultPdfFields1.auxiliaryHallCheck);
      const auxiliaryHall2Check = form.getCheckBox(this.defaultPdfFields1.auxiliaryHall2Check);

      //Assign fields
      principal.setText(this.participantService.getParticipant(assignment.principal).name);
      if (assignment.assistant) {
        assistant.setText(this.participantService.getParticipant(assignment.assistant).name);
      }
      date.setText(
        this.translocoLocaleService.localizeDate(
          assignment.date,
          this.translocoLocaleService.getLocale(),
          { dateStyle: "full" }
        )
      );

      const type = this.assignTypeService.getAssignType(assignment.assignType).type;

      if (type === "bibleReading") {
        bibleReadingCheck.check();
      }
      if (type === "initialCall") {
        initialCallCheck.check();
      }
      if (type === "returnVisit") {
        returnVisitCheck.check();
      }
      if (type === "bibleStudy") {
        bibleStudyCheck.check();
      }
      if (type === "talk") {
        talkCheck.check();
      }
      if (type === "other") {
        otherCheck.check();
        otherText.setText(assignment.theme);
      }

      const roomType = this.roomService.getRoom(assignment.room).type;

      if (roomType === "mainHall") {
        mainHallCheck.check();
      }
      if (roomType === "auxiliaryRoom1") {
        auxiliaryHallCheck.check();
      }
      if (roomType === "auxiliaryRoom2") {
        auxiliaryHall2Check.check();
      }

      form.flatten();
      return await pdfDoc.save();
    }
  }
  //M=Multiple
  async toPdfS89M(assignmentList: AssignmentInterface[]): Promise<Uint8Array> {
    //Filter only the assignments that can be S89
    assignmentList = assignmentList.filter((a) => this.isAllowedTypeForS89(a));

    //Get all the iterations by 4, check if there is a decimal part, if there is, truncate and add +1
    // 12,5 => 12 + 1 (the last page will have some sheets empty)
    let iterations = assignmentList.length / 4;
    if (iterations % 1 != 0) iterations = Math.trunc(iterations) + 1;

    for (let iteration = 0; iteration < iterations; iteration++) {
      //Get the template and the form inside
      const s89mTemplate = await this.getPdfTemplateFile(this.S89M);
      const form = s89mTemplate.getForm();

      //For every iteration get a slice of 4 assignments
      const end = 4 * (iteration + 1); //We need to add +1 or in the first iteration end is 0.
      const init = end - 4;

      for (let [i, a] of assignmentList.slice(init, end).entries()) {
        //Get fields, i (index is zero based, we need to add +1)
        const index = i + 1;
        //Assign the default1 so typescript infers the keys
        let defaultPdfFields = this.defaultPdfFields1;
        if (index === 1) {
          defaultPdfFields = this.defaultPdfFields1;
        }
        if (index === 2) {
          defaultPdfFields = this.defaultPdfFields2;
        }
        if (index === 3) {
          defaultPdfFields = this.defaultPdfFields3;
        }
        if (index === 4) {
          defaultPdfFields = this.defaultPdfFields4;
        }

        const principal = form.getTextField(defaultPdfFields.principal);
        principal.setFontSize(10);
        const assistant = form.getTextField(defaultPdfFields.assistant);
        assistant.setFontSize(10);
        const date = form.getTextField(defaultPdfFields.date);
        date.setFontSize(10);
        const bibleReadingCheck = form.getCheckBox(defaultPdfFields.bibleReadingCheck);
        const initialCallCheck = form.getCheckBox(defaultPdfFields.initialCallCheck);
        const returnVisitCheck = form.getCheckBox(defaultPdfFields.returnVisitCheck);
        const bibleStudyCheck = form.getCheckBox(defaultPdfFields.bibleStudyCheck);
        const talkCheck = form.getCheckBox(defaultPdfFields.talkCheck);
        const otherCheck = form.getCheckBox(defaultPdfFields.otherCheck);
        const otherText = form.getTextField(defaultPdfFields.otherText);

        const mainHallCheck = form.getCheckBox(defaultPdfFields.mainHallCheck);
        const auxiliaryHallCheck = form.getCheckBox(defaultPdfFields.auxiliaryHallCheck);
        const auxiliaryHall2Check = form.getCheckBox(defaultPdfFields.auxiliaryHall2Check);

        //Assign fields
        principal.setText(this.participantService.getParticipant(a.principal).name);
        if (a.assistant) {
          assistant.setText(this.participantService.getParticipant(a.assistant).name);
        }
        date.setText(
          this.translocoLocaleService.localizeDate(
            a.date,
            this.translocoLocaleService.getLocale(),
            { dateStyle: "full" }
          )
        );

        const type = this.assignTypeService.getAssignType(a.assignType).type;

        if (type === "bibleReading") {
          bibleReadingCheck.check();
        }
        if (type === "initialCall") {
          initialCallCheck.check();
        }
        if (type === "returnVisit") {
          returnVisitCheck.check();
        }
        if (type === "bibleStudy") {
          bibleStudyCheck.check();
        }
        if (type === "talk") {
          talkCheck.check();
        }
        if (type === "other") {
          otherCheck.check();
          otherText.setText(a.theme);
        }

        const roomType = this.roomService.getRoom(a.room).type;

        if (roomType === "mainHall") {
          mainHallCheck.check();
        }
        if (roomType === "auxiliaryRoom1") {
          auxiliaryHallCheck.check();
        }
        if (roomType === "auxiliaryRoom2") {
          auxiliaryHall2Check.check();
        }
      }
      form.flatten();
      const pdfBytes = await s89mTemplate.save();

      //Ensure the filename is valid for the system
      const fileNamePath = filenamifyPath(
        path.join(this.homeDir, "assignments", iteration + "-" + this.S89M)
      );
      ensureFileSync(fileNamePath);
      writeFile(fileNamePath, pdfBytes);
    }
    //Now we have N iteration files, lets merge them
    const pdf = await PDFDocument.create();
    for (let i = 0; i < iterations; i++) {
      const filename = i + "-" + this.S89M;
      const p = path.join(this.homeDir, "assignments", i + "-" + this.S89M);
      const iterationPdf = await this.getPdfTemplateFile(filename, p);
      //The description of copyPages doesnt add a page to the new pdf, it just returns the copied pages
      const [page] = await pdf.copyPages(iterationPdf, [0]);
      //Thats why we need to add the page here
      pdf.addPage(page);
    }
    return pdf.save();
  }
}
