import { Injectable } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";
import jsPDF, { jsPDFOptions } from "jspdf";

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

export type pdfFileNames = "S89S";
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

  //Pdf file names
  S89S = "S89S.pdf";

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

  async getPdfTemplateFile(name: string) {
    const pdfFile = readFileSync(
      path.join(
        this.configService.templatesFilesPath,
        this.configService.getConfig().lang,
        "pdf",
        name
      )
    );
    return await PDFDocument.load(pdfFile);
  }

  isAllowedTypeForS89S(assignment: AssignmentInterface): boolean {
    const type = this.assignTypeService.getAssignType(assignment.assignType).type;
    return (
      type === "bibleReading" ||
      type === "initialCall" ||
      type === "returnVisit" ||
      type === "bibleStudy" ||
      type === "talk"
    );
  }

  async toPdfS89S(assignment: AssignmentInterface): Promise<Uint8Array> {
    if (this.isAllowedTypeForS89S(assignment)) {
      const pdfDoc = await this.getPdfTemplateFile(this.S89S);
      const form = pdfDoc.getForm();
      //Get fields
      const principal = form.getTextField("principal");
      principal.setFontSize(10);
      const assistant = form.getTextField("assistant");
      assistant.setFontSize(10);
      const date = form.getTextField("date");
      date.setFontSize(10);
      const bibleReadingCheck = form.getCheckBox("bibleReadingCheck");
      const initialCallCheck = form.getCheckBox("initialCallCheck");
      const returnVisitCheck = form.getCheckBox("returnVisitCheck");
      const bibleStudyCheck = form.getCheckBox("bibleStudyCheck");
      const talkCheck = form.getCheckBox("talkCheck");
      const otherCheck = form.getCheckBox("otherCheck");
      const otherText = form.getTextField("otherText");

      const mainHallCheck = form.getCheckBox("mainHallCheck");
      const auxiliaryHallCheck = form.getCheckBox("auxiliaryHallCheck");
      const auxiliaryHall2Check = form.getCheckBox("auxiliaryHall2Check");

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
}
