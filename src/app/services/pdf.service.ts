import { Injectable } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";
import jsPDF, { jsPDFOptions } from "jspdf";

import meiryo from "../../resources/base64fonts/meiryo";
import malgun from "../../resources/base64fonts/malgun";
import simsun from "../../resources/base64fonts/simsun";
import notosans from "../../resources/base64fonts/notosans";
import notosansbold from "../../resources/base64fonts/notosansbold";

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

  constructor(private translocoService: TranslocoService) {}

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
}
