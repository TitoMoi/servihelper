import { Injectable } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";
import jsPDF from "jspdf";

import meiryo from "../../resources/base64fonts/meiryo";
import malgun from "../../resources/base64fonts/malgun";
import simsun from "../../resources/base64fonts/simsun";
import notosans from "../../resources/base64fonts/notosans";

@Injectable({
  providedIn: "root",
})
export class PdfService {
  jsPdfPortrait: jsPDF;
  jsPdfLandscape: jsPDF;

  langToFont = {
    ja: "meiryo",
    ko: "malgun",
    zhCN: "simsun",
  };
  font;

  constructor(private translocoService: TranslocoService) {
    this.translocoService.langChanges$.subscribe((lang) => {
      this.font = this.langToFont[lang];
      if (!this.font) this.font = "notosans";
    });

    this.jsPdfPortrait = new jsPDF("portrait");
    this.jsPdfLandscape = new jsPDF("landscape");

    //Japanese

    this.jsPdfPortrait.addFileToVFS("meiryo-normal.ttf", meiryo);
    this.jsPdfPortrait.addFont("meiryo-normal.ttf", "meiryo", "normal");

    this.jsPdfLandscape.addFileToVFS("meiryo-normal.ttf", meiryo);
    this.jsPdfLandscape.addFont("meiryo-normal.ttf", "meiryo", "normal");

    //Korean
    this.jsPdfPortrait.addFileToVFS("malgun.ttf", malgun);
    this.jsPdfPortrait.addFont("malgun.ttf", "malgun", "normal");

    this.jsPdfLandscape.addFileToVFS("malgun.ttf", malgun);
    this.jsPdfLandscape.addFont("malgun.ttf", "malgun", "normal");

    //Simplified Chinese
    this.jsPdfPortrait.addFileToVFS("simsun.ttf", simsun);
    this.jsPdfPortrait.addFont("simsun.ttf", "simsun", "normal");

    this.jsPdfLandscape.addFileToVFS("simsun.ttf", simsun);
    this.jsPdfLandscape.addFont("simsun.ttf", "simsun", "normal");

    //Latin, Cyrilic
    this.jsPdfPortrait.addFileToVFS("notosans.ttf", notosans);
    this.jsPdfPortrait.addFont("notosans.ttf", "notosans", "normal");

    this.jsPdfLandscape.addFileToVFS("notosans.ttf", notosans);
    this.jsPdfLandscape.addFont("notosans.ttf", "notosans", "normal");
  }

  /**
   *
   * @param disposition portrait or landscape
   */
  getJsPdf(disposition: string) {
    return disposition === "landscape"
      ? this.jsPdfLandscape
      : this.jsPdfPortrait;
  }

  /**
   *
   * @returns meiryo for japanese, malgun for korean, simsun for simplified chinese and noto sans for else.
   */
  getFontForLang() {
    return this.font;
  }
}
