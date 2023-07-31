import { Injectable } from "@angular/core";
import { toPng } from "html-to-image";

@Injectable({
  providedIn: "root",
})
export class ExportService {
  constructor() {}

  /**
   *
   * @param elemId the id of the div to export
   * @param filename the name of the file to save
   */
  async toPng(elemId, filename: string = "image") {
    //the div
    document.body.style.cursor = "wait";
    const div = document.getElementById(elemId);
    if (div) {
      const dataUrl = await toPng(div);

      const link = document.createElement("a");
      link.href = dataUrl;
      link.setAttribute("download", `${filename}.png`);
      link.click();
    }
    document.body.style.cursor = "default";
  }
}
