import { Injectable } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";
import { jsPDF, jsPDFOptions } from "jspdf";

import meiryo from "../../resources/base64fonts/meiryo";
import malgun from "../../resources/base64fonts/malgun";
import simsun from "../../resources/base64fonts/simsun";
import notosans from "../../resources/base64fonts/notosans";
import notosansbold from "../../resources/base64fonts/notosansbold";
import path from "path";
import { ConfigService } from "app/config/service/config.service";
import { readFileSync } from "fs";
import { ParticipantService } from "app/participant/service/participant.service";
import { TranslocoLocaleService } from "@ngneat/transloco-locale";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { RoomService } from "app/room/service/room.service";

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

  async toPdfS89(assignments: AssignmentInterface[], is4slips: boolean) {
    assignments = assignments.filter((a) => this.isAllowedTypeForS89(a));

    let doc = this.getJsPdf({
      orientation: "portrait",
      format: is4slips ? "a4" : [113.03, 85.09],
      compress: true,
    });

    let counter = 4;

    assignments.forEach((assignment, i) => {
      if (counter === 0) {
        doc = doc.addPage("a4", "p");
        counter = 4;
      }
      //Default values is first slip
      let x = 9;
      let y = 7;
      //Position in the sheet
      if (i % 1 === 0) {
        x = 9;
        y = 7;
      } else if (i % 2 === 0) {
        x = 105;
        y = 7;
      } else if (i % 3 === 0) {
        x = 9;
        y = 148.5;
      } else if (i % 4 === 0) {
        x = 105;
        y = 148.5;
      }

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

      counter -= 1;
    });
    return doc.output("blob");
  }
}
