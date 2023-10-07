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
import { filenamifyPath } from "filenamify";
import { ensureFileSync, pathExistsSync, writeFile } from "fs-extra";

export type pdfFileNames = "S89S" | "S89SM";
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
  S89S = "S89S.pdf";
  S89SM = "S89SM.pdf";

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
  checkTemplateExists(name: string, optionalPath?: string) {
    const filePath = optionalPath
      ? optionalPath
      : path.join(
          this.configService.templatesFilesPath,
          this.configService.getConfig().lang,
          "pdf",
          name
        );
    const exists = pathExistsSync(filePath);
    return exists;
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
  /**
   *
   * @param assignment the assignment to S89S
   * @returns the pdf array
   */
  async toPdfS89S(assignment: AssignmentInterface): Promise<Uint8Array> {
    if (this.isAllowedTypeForS89S(assignment)) {
      const pdfDoc = await this.getPdfTemplateFile(this.S89S);
      const form = pdfDoc.getForm();

      const copiedPage = await pdfDoc.copyPages(pdfDoc, [0]);

      copiedPage[0].doc.getForm();
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
  //M=Multiple
  async toPdfS89SM(assignmentList: AssignmentInterface[]): Promise<Uint8Array> {
    //Filter only the assignments that can be S89S
    assignmentList = assignmentList.filter((a) => this.isAllowedTypeForS89S(a));

    //Get all the iterations by 4, check if there is a decimal part, if there is, truncate and add +1
    // 12,5 => 12 + 1 (the last page will have some sheets empty)
    let iterations = assignmentList.length / 4;
    if (iterations % 1 != 0) iterations = Math.trunc(iterations) + 1;

    for (let iteration = 0; iteration < iterations; iteration++) {
      //Get the template and the form inside
      const s89smTemplate = await this.getPdfTemplateFile(this.S89SM);
      const form = s89smTemplate.getForm();

      //For every iteration get a slice of 4 assignments
      const end = 4 * (iteration + 1); //We need to add +1 or in the first iteration end is 0.
      const init = end - 4;

      for (let [i, a] of assignmentList.slice(init, end).entries()) {
        //Get fields, i (index is zero based, we need to add +1)
        const index = i + 1;
        const principal = form.getTextField("principal" + index);
        principal.setFontSize(10);
        const assistant = form.getTextField("assistant" + index);
        assistant.setFontSize(10);
        const date = form.getTextField("date" + index);
        date.setFontSize(10);
        const bibleReadingCheck = form.getCheckBox("bibleReadingCheck" + index);
        const initialCallCheck = form.getCheckBox("initialCallCheck" + index);
        const returnVisitCheck = form.getCheckBox("returnVisitCheck" + index);
        const bibleStudyCheck = form.getCheckBox("bibleStudyCheck" + index);
        const talkCheck = form.getCheckBox("talkCheck" + index);
        const otherCheck = form.getCheckBox("otherCheck" + index);
        const otherText = form.getTextField("otherText" + index);

        const mainHallCheck = form.getCheckBox("mainHallCheck" + index);
        const auxiliaryHallCheck = form.getCheckBox("auxiliaryHallCheck" + index);
        const auxiliaryHall2Check = form.getCheckBox("auxiliaryHall2Check" + index);

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
      const pdfBytes = await s89smTemplate.save();

      //Ensure the filename is valid for the system
      const fileNamePath = filenamifyPath(
        path.join(this.homeDir, "assignments", iteration + "-" + this.S89SM)
      );
      ensureFileSync(fileNamePath);
      writeFile(fileNamePath, pdfBytes);
    }
    //Now we have N iteration files, lets merge them
    const pdf = await PDFDocument.create();
    for (let i = 0; i < iterations; i++) {
      const filename = i + "-" + this.S89SM;
      const p = path.join(this.homeDir, "assignments", i + "-" + this.S89SM);
      const iterationPdf = await this.getPdfTemplateFile(filename, p);
      //The description of copyPages doesnt add a page to the new pdf, it just returns the copied pages
      const [page] = await pdf.copyPages(iterationPdf, [0]);
      //Thats why we need to add the page here
      pdf.addPage(page);
    }
    return pdf.save();
  }
}
