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
import {
  AssignmentGroupInterface,
  AssignmentInterface,
} from "app/assignment/model/assignment.model";
import { RoomService } from "app/room/service/room.service";
import { AssignTypes } from "app/assigntype/model/assigntype.model";
import { AssignTypeNamePipe } from "app/assigntype/pipe/assign-type-name.pipe";
import { RoomNamePipe } from "app/room/pipe/room-name.pipe";

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

  backupLang;

  //Pdf file names
  S89 = "S89.pdf";
  S89M = "S89M.pdf";

  constructor(
    private configService: ConfigService,
    private translocoService: TranslocoService,
    private translocoLocaleService: TranslocoLocaleService,
    private participantService: ParticipantService,
    private assignTypeService: AssignTypeService,
    private assignTypeNamePipe: AssignTypeNamePipe,
    private roomNamePipe: RoomNamePipe,
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
   * @param name the lang
   */
  checkLangExists(name: string) {
    if (this.S89 === name) {
      const availableTemplates = ["en", "ca", "es", "fr", "pt", "it", "de", "nl"];
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

  shortAssignTypeTheme(doc: jsPDF, a: AssignmentInterface): string {
    const at = this.assignTypeService.getAssignType(a.assignType);
    let themeOrAssignType = a.theme ? a.theme : this.assignTypeNamePipe.transform(at);

    let wordLength = 95;
    //Before create text lines check the length
    if (themeOrAssignType.length > wordLength) {
      const shortedTheme = [];
      let words = themeOrAssignType.split(" ");
      for (let w of words) {
        if (wordLength - w.length > 0) {
          shortedTheme.push(w);
          wordLength -= w.length;
        } else {
          break;
        }
      }
      themeOrAssignType = shortedTheme.join(" ") + " (...)";
    }
    return doc.splitTextToSize(themeOrAssignType, 75);
  }

  calculateY(doc: jsPDF, y: number, isForPrint: boolean) {
    if (isForPrint && y > 270) {
      doc.addPage("a4", "p");
      y = 10;
    }
    return y;
  }

  getPdfHeight(assignmentGroups: AssignmentGroupInterface[]): number {
    let height = 0;
    //Title
    height += 7;
    //End
    height += 20;

    let doc = this.getJsPdf({
      orientation: "portrait",
      format: [210, 9000],
      compress: true,
    });

    doc.setFont(this.font, "bold");
    doc.setFontSize(11);

    let x = 10;
    let y = 10;

    const reportTitle = this.configService.getConfig().reportTitle;
    if (reportTitle) {
      doc.text(reportTitle, doc.internal.pageSize.width / 2, y, {
        align: "center",
      });
    }
    y += 7;

    for (const ag of assignmentGroups) {
      doc.setFont(this.font, "bold");
      doc.setFontSize(11);
      //Date
      const localeDate = this.translocoLocaleService.localizeDate(
        ag.assignments[0].date,
        this.translocoLocaleService.getLocale(),
        { dateStyle: "full" }
      );
      doc.text(localeDate, x, y);

      //Room
      const roomName = this.roomNamePipe.transform(ag.assignments[0].room);
      doc.text(roomName, 150, y);

      y += 6;
      doc.setFont(this.font, "normal");
      doc.setFontSize(10);
      for (const a of ag.assignments) {
        const themeOrAssignType = a.theme || this.assignTypeNamePipe.transform(a.assignType);

        let striped = themeOrAssignType.substring(0, 220);

        if (striped.length === 220) {
          striped = striped + "(...)";
        }

        let stripedLines = doc.splitTextToSize(striped, 120);

        const heightTheme = 3.5 * (stripedLines.length + 1);
        doc.text(stripedLines, x, y);

        const participantsNames =
          a.principal.name + (a.assistant ? "/\n" + a.assistant.name : "");

        let textLinesParticipants = doc.splitTextToSize(participantsNames, 90);

        const heightParticipantNames = 3.5 * (textLinesParticipants.length + 1);

        doc.text(textLinesParticipants, 150, y);

        const yHeight =
          heightTheme > heightParticipantNames ? heightTheme : heightParticipantNames;
        y += yHeight;
      }
      y += 7;
    }
    return height + y;
  }

  /**
   * Render an inifite list with or without the colored bands
   * @param assignmentGroups the assignment groups
   */
  toPdf(
    assignmentGroups: AssignmentGroupInterface[],
    colorBands: boolean,
    isForPrint: boolean = false
  ) {
    const height = this.getPdfHeight(assignmentGroups);

    let doc = this.getJsPdf({
      orientation: "portrait",
      format: [210, isForPrint ? 270 : height],
      compress: true,
    });

    doc.setFont(this.font, "bold");
    doc.setFontSize(11);

    let x = 10;
    let y = 10;

    const reportTitle = this.configService.getConfig().reportTitle;
    if (reportTitle) {
      doc.text(reportTitle, doc.internal.pageSize.width / 2, y, {
        align: "center",
      });
    }

    y = this.calculateY(doc, y + 7, isForPrint);

    for (const ag of assignmentGroups) {
      doc.setFont(this.font, "bold");
      doc.setFontSize(12);
      //Date
      const localeDate = this.translocoLocaleService.localizeDate(
        ag.assignments[0].date,
        this.translocoLocaleService.getLocale(),
        { dateStyle: "full" }
      );
      doc.text(localeDate, x, y);

      //Room
      const roomName = this.roomNamePipe.transform(ag.assignments[0].room);
      doc.text(roomName, 150, y);

      y = this.calculateY(doc, y + 6, isForPrint);

      doc.setFont(this.font, "normal");
      doc.setFontSize(11);
      for (const a of ag.assignments) {
        const themeOrAssignType = a.theme || this.assignTypeNamePipe.transform(a.assignType);

        let striped = themeOrAssignType.substring(0, 220);

        if (striped.length === 220) {
          striped = striped + "(...)";
        }

        let stripedLines = doc.splitTextToSize(striped, 120);

        const heightTheme = 3.5 * (stripedLines.length + 1);
        doc.text(stripedLines, x, y);

        const participantsNames =
          a.principal.name + (a.assistant ? "/\n" + a.assistant.name : "");

        let textLinesParticipants = doc.splitTextToSize(participantsNames, 90);

        const heightParticipantNames = 3.5 * (textLinesParticipants.length + 1);

        const yHeight =
          heightTheme > heightParticipantNames ? heightTheme : heightParticipantNames;

        if (colorBands) {
          doc.setFillColor(a.assignType.color);
          //Rectangles draw to bottom so we need to move the pointer up
          doc.rect(145, y - 6 / 1.5, 4, yHeight, "F");
        }

        doc.text(textLinesParticipants, 150, y);

        y = this.calculateY(doc, y + yHeight, isForPrint);
      }
      y = this.calculateY(doc, y + 7, isForPrint);
    }

    return doc.save("assignmentsList");
  }

  async toPdfS89(assignments: AssignmentInterface[], is4slips: boolean) {
    assignments = assignments.filter((a) => this.isAllowedTypeForS89(a));

    let doc = this.getJsPdf({
      orientation: "portrait",
      format: is4slips ? "a4" : [113.03, 85.09],
      compress: true,
    });

    let counter = 4;

    //The S89 in not available in catalan.
    if (this.translocoService.getActiveLang() === "ca") {
      this.backupLang = "ca";
      this.translocoService = this.translocoService.setActiveLang("es");
    }

    assignments.forEach((assignment, i) => {
      i = i + 1; //1 index based to count slips
      if (counter === 0) {
        doc = doc.addPage("a4", "p");
        counter = 4;
      }
      //Default value for coord is first slip
      let x = 9;
      let y = 7;
      //Position in the sheet from left to right to bottom left and then right
      switch (counter) {
        case 4:
          x = 9;
          y = 7;
          break;
        case 3:
          x = 115;
          y = 7;
          break;
        case 2:
          x = 9;
          y = 148.5;
          break;
        case 1:
          x = 115;
          y = 148.5;
          break;
      }

      doc.setFont(this.font, "bold");
      doc.setFontSize(11.2);

      x -= 5;

      const xOffset = doc.internal.pageSize.width / 2;
      const title1 = this.translocoService.translate("S89_TITLE_1");
      doc.text(title1, xOffset, y, { align: "center" });
      y += 5;
      const title2 = this.translocoService.translate("S89_TITLE_2");
      doc.text(title2, xOffset, y, {
        align: "center",
      });

      y += 7;

      doc.setFont(this.font, "bold");
      doc.setFontSize(11.2);
      const s89Name = this.translocoService.translate("S89_NAME");
      let xPosForText = x + doc.getTextWidth(s89Name) + 2;
      doc.text(s89Name, x, y);
      doc.setFont(this.font, "normal");
      doc.setFontSize(8.2);
      doc.text(
        this.participantService.getParticipant(assignment.principal).name,
        xPosForText,
        y
      );

      y += 7;

      doc.setFont(this.font, "bold");
      doc.setFontSize(11.2);
      const s89Assistant = this.translocoService.translate("S89_ASSISTANT");
      xPosForText = x + doc.getTextWidth(s89Assistant) + 2;
      doc.text(s89Assistant, x, y);
      doc.setFont(this.font, "normal");
      doc.setFontSize(8.2);
      if (assignment.assistant)
        doc.text(
          this.participantService.getParticipant(assignment.assistant).name,
          xPosForText,
          y
        );

      y += 7;

      doc.setFont(this.font, "bold");
      doc.setFontSize(11.2);
      const s89Date = this.translocoService.translate("S89_DATE");
      xPosForText = x + doc.getTextWidth(s89Date) + 2;
      doc.text(s89Date, x, y);
      doc.setFont(this.font, "normal");
      doc.setFontSize(8.2);
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
      doc.setFontSize(8.2);
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

      x -= 5;

      const canBeRepeated: AssignTypes[] = ["initialCall", "returnVisit"];
      if (canBeRepeated.includes(type) && assignment.theme) {
        y += 1;
        doc.setFontSize(7);
        const themeText = this.shortAssignTypeTheme(doc, assignment);
        doc.text(themeText, x, y);
        y += 8;
      } else {
        //closer gap
        y += 7;
      }

      doc.setFont(this.font, "bold");
      doc.setFontSize(8.2);

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

      y += 4;

      doc.text(this.translocoService.translate("S89_VERSION"), x, y);
      doc.text(this.translocoService.translate("S89_DATE_VERSION"), x + 15, y);

      counter -= 1;
    });
    if (this.backupLang) this.translocoService.setActiveLang(this.backupLang);
    return doc.output("blob");
  }
}
