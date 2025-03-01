/* eslint-disable complexity */
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
    private roomService: RoomService,
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
    this.jsPdf.addFileToVFS("meiryo-normal.ttf", meiryo);
    this.jsPdf.addFont("meiryo-normal.ttf", "meiryo", "normal");
  }

  addKoreanFont() {
    this.jsPdf.addFileToVFS("malgun.ttf", malgun);
    this.jsPdf.addFont("malgun.ttf", "malgun", "normal");
  }

  addSimplifiedChineseFont() {
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

  getFontForLang() {
    return this.font;
  }

  getWeekCounter(isWeekend: boolean, isCompressed: boolean, has5Weeks: boolean) {
    return isWeekend ? 5 : isCompressed ? (has5Weeks ? 5 : 4) : 2;
  }

  getInitialHeight(isCompressed: boolean) {
    return isCompressed ? 10 : 20;
  }

  getInitialWidth(isCompressed: boolean) {
    return isCompressed ? 5 : 15;
  }

  getEndingWidth(isCompressed: boolean) {
    return isCompressed ? 5 : 15;
  }

  getPageWidth() {
    return 210;
  }

  getDateFontSize(isCompressed: boolean) {
    return isCompressed ? 10 : 13.5;
  }

  getTextFontSize(isCompressed: boolean, isMultipleOf5 = false) {
    return isCompressed ? (isMultipleOf5 ? 8 : 9.5) : 10.5;
  }

  /**
   * Get the font size for the territory pdf
   * @returns number, the font size
   */
  getTerritoryTextFontSize() {
    return 36;
  }

  addHeavyCheckImg(doc: jsPDF, x, y) {
    const image = path.join(this.configService.iconsFilesPath, "heavycheck.png");
    const uint8array = new Uint8Array(readFileSync(image));
    doc.addImage(uint8array, "PNG", x, y, 3, 3);
  }

  shortAssignTypeTheme(doc: jsPDF, a: AssignmentInterface): string {
    const at = this.assignTypeService.getAssignType(a.assignType);
    let themeOrAssignType = a.theme
      ? a.theme
      : this.assignTypeService.getNameOrTranslation(at);

    let wordLength = 130;
    //Before create text lines check the length
    if (themeOrAssignType.length > wordLength) {
      const shortedTheme = [];
      const words = themeOrAssignType.split(" ");
      for (const w of words) {
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
    height += 5;

    const doc = this.getJsPdf({
      orientation: "portrait",
      format: [210, 9000],
      compress: true,
    });

    doc.setFont(this.font, "bold");
    doc.setFontSize(11);

    const x = 10;
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
      doc.setFontSize(this.getDateFontSize(false));
      //Date
      const localeDate = this.translocoLocaleService.localizeDate(
        ag.assignments[0].date,
        this.translocoLocaleService.getLocale(),
        { dateStyle: "full" },
      );
      doc.text(localeDate, x, y);

      //Room
      const roomName = this.roomService.getNameOrTranslation(ag.assignments[0].room);
      doc.text(roomName, 150, y);

      y += 6;

      doc.setFont(this.font, "normal");
      doc.setFontSize(this.getTextFontSize(false));

      for (const a of ag.assignments) {
        const themeOrAssignType =
          a.theme || this.assignTypeService.getNameOrTranslation(a.assignType);

        let striped = themeOrAssignType.substring(0, 220);

        if (striped.length === 220) {
          striped = striped + "(...)";
        }

        const stripedLines = doc.splitTextToSize(striped, 120);

        const heightTheme = 3.5 * (stripedLines.length + 1);
        doc.text(stripedLines, x, y);

        const participantsNames =
          a.principal.name + (a.assistant ? "/\n" + a.assistant.name : "");

        const textLinesParticipants = doc.splitTextToSize(participantsNames, 90);

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
    isForPrint: boolean = false,
  ) {
    const height = this.getPdfHeight(assignmentGroups);

    const doc = this.getJsPdf({
      orientation: "portrait",
      format: [210, isForPrint ? 270 : height],
      compress: true,
    });

    doc.setFont(this.font, "bold");
    doc.setFontSize(this.getDateFontSize(false)); //It's not date but the same font size

    const x = 10;
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
      doc.setFontSize(this.getDateFontSize(false));
      //Date
      const localeDate = this.translocoLocaleService.localizeDate(
        ag.assignments[0].date,
        this.translocoLocaleService.getLocale(),
        { dateStyle: "full" },
      );
      doc.text(localeDate, x, y);

      //Room
      const roomName = this.roomService.getNameOrTranslation(ag.assignments[0].room);
      doc.text(roomName, 150, y);

      y = this.calculateY(doc, y + 6, isForPrint);

      doc.setFont(this.font, "normal");
      doc.setFontSize(this.getTextFontSize(false));

      for (const a of ag.assignments) {
        const themeOrAssignType =
          a.theme || this.assignTypeService.getNameOrTranslation(a.assignType);

        let striped = themeOrAssignType.substring(0, 220);

        if (striped.length === 220) {
          striped = striped + "(...)";
        }

        const stripedLines = doc.splitTextToSize(striped, 120);

        const heightTheme = 3.5 * (stripedLines.length + 1);
        doc.text(stripedLines, x, y);

        const participantsNames =
          a.principal.name + (a.assistant ? "/\n" + a.assistant.name : "");

        const textLinesParticipants = doc.splitTextToSize(participantsNames, 90);

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

  /**
   * Creates a slip s89 or a 4-slip89 pdf
   */
  async toPdfS89(assignments: AssignmentInterface[], is4slips: boolean) {
    const {
      s89Title1,
      s89Title2,
      s89Principal,
      s89Assistant,
      s89Date,
      s89Number,
      s89RoomsTitle,
      s89NoteBoldPart,
      s89NoteContentPart,
      s89Version,
      s89DateVersion,
    } = this.configService.getConfig();

    let doc = this.getJsPdf({
      orientation: "portrait",
      format: is4slips ? "a4" : [113.03, 85.09],
      compress: true,
    });

    let counter = 4;

    // The S89 in not available in catalan.
    if (this.translocoService.getActiveLang() === "ca") {
      this.backupLang = "ca";
      this.translocoService = this.translocoService.setActiveLang("es");
    } else {
      this.backupLang = null;
    }

    assignments.forEach((assignment) => {
      if (counter === 0) {
        doc = doc.addPage("a4", "p");
        counter = 4;
      }
      // Default value for coord is first slip
      let x = 9;
      let y = 7;
      // Position in the sheet from left to right to bottom left and then right
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

      let xOffset = doc.internal.pageSize.width / (is4slips ? 4 : 2);

      if (is4slips && (counter === 3 || counter === 1)) {
        xOffset = xOffset * 3;
      }
      // Title 1 and 2
      const title1 = s89Title1 || this.translocoService.translate("S89_TITLE_1");
      doc.text(title1, xOffset, y, { align: "center" });
      y += 5;
      const title2 = s89Title2 || this.translocoService.translate("S89_TITLE_2");
      doc.text(title2, xOffset, y, {
        align: "center",
      });

      y += 7;

      // Principal
      doc.setFont(this.font, "bold");
      doc.setFontSize(11.2);
      const s89Name = s89Principal || this.translocoService.translate("S89_NAME");
      let xPosForText = x + doc.getTextWidth(s89Name) + 2;
      doc.text(s89Name, x, y);
      doc.setFont(this.font, "normal");
      doc.setFontSize(8.2);
      doc.text(
        this.participantService.getParticipant(assignment.principal).name,
        xPosForText,
        y,
      );

      y += 7;

      // Assistant
      doc.setFont(this.font, "bold");
      doc.setFontSize(11.2);
      const s89AssistantKey = s89Assistant || this.translocoService.translate("S89_ASSISTANT");
      xPosForText = x + doc.getTextWidth(s89AssistantKey) + 2;
      doc.text(s89AssistantKey, x, y);
      doc.setFont(this.font, "normal");
      doc.setFontSize(8.2);
      if (assignment.assistant)
        doc.text(
          this.participantService.getParticipant(assignment.assistant).name,
          xPosForText,
          y,
        );

      y += 7;

      // Date
      doc.setFont(this.font, "bold");
      doc.setFontSize(11.2);
      const s89DateKey = s89Date || this.translocoService.translate("S89_DATE");
      xPosForText = x + doc.getTextWidth(s89DateKey) + 2;
      doc.text(s89DateKey, x, y);
      doc.setFont(this.font, "normal");
      doc.setFontSize(8.2);
      doc.text(
        this.translocoLocaleService.localizeDate(
          assignment.date,
          this.translocoLocaleService.getLocale(),
          { dateStyle: "full" },
        ),
        xPosForText,
        y,
      );

      y += 7;

      // Assignment number
      doc.setFont(this.font, "bold");
      doc.setFontSize(11.2);
      const s89assignmentNumber =
        s89Number || this.translocoService.translate("S89_ASSIGNMENT_NUMBER");
      xPosForText = x + doc.getTextWidth(s89assignmentNumber) + 2;
      doc.text(s89assignmentNumber, x, y);
      doc.setFont(this.font, "normal");
      doc.setFontSize(8.2);
      if (assignment.theme) {
        //If its copied from the web the first letter is the number.
        const numString = assignment.theme.charAt(0);
        const num = Number.parseInt(numString);
        if (Number.isInteger(num)) {
          doc.text(numString, xPosForText, y);
        }
        //If its copied from the web the second letter MAY be a number.
        const numString2 = assignment.theme.charAt(1);
        const num2 = Number.parseInt(numString2);
        if (Number.isInteger(num2)) {
          doc.text(numString2, xPosForText + 1.5, y);
        }
      }

      // theme
      y += 8;
      doc.setFontSize(7.2);
      const themeText = this.shortAssignTypeTheme(doc, assignment);
      doc.text(themeText, x, y);

      y += 15;

      doc.setFont(this.font, "bold");
      doc.setFontSize(8.2);

      const roomsTitleKey =
        s89RoomsTitle || this.translocoService.translate("S89_ROOMS_TITLE");
      doc.text(roomsTitleKey, x, y);

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

      let userFooterText = "";
      if (s89NoteBoldPart && s89NoteContentPart) {
        userFooterText = "[b]" + s89NoteBoldPart + "*" + s89NoteContentPart;
      }

      const footerText: string[] = doc.splitTextToSize(
        userFooterText || this.translocoService.translate("S89_FOOTERNOTE"),
        77,
      );

      const startXCached = x;
      footerText.map((text) => {
        if (text) {
          const arrayOfNormalAndBoldText = text.split("*");
          arrayOfNormalAndBoldText.map((textItems) => {
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

      const versionKey = s89Version || this.translocoService.translate("S89_VERSION");
      doc.text(versionKey, x, y);

      const dateVersionKey =
        s89DateVersion || this.translocoService.translate("S89_DATE_VERSION");
      doc.text(dateVersionKey, x + 15, y);

      counter -= 1;
    });
    if (this.backupLang) this.translocoService.setActiveLang(this.backupLang);
    return doc.output("blob");
  }
}
