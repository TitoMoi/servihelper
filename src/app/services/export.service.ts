import { Injectable } from "@angular/core";
import { clipboard, nativeImage } from "electron";
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
  async toPng(elemId: string, filename: string = "image") {
    //the div
    document.body.style.cursor = "wait";
    const div = document.getElementById(elemId);
    if (div) {
      const dataUrl = await toPng(div, { pixelRatio: 2 });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.setAttribute("download", `${filename}.png`);
      link.click();
    }
    document.body.style.cursor = "default";
  }

  /**
   *
   * @param elemId the id of the div to export
   */
  async toClipboard(elemId: string) {
    document.body.style.cursor = "wait";
    const node = document.getElementById(elemId);
    const dataUrl = await toPng(node, { pixelRatio: 2 });
    const natImage = nativeImage.createFromDataURL(dataUrl);
    clipboard.write(
      {
        image: natImage,
      },
      "selection",
    );
    document.body.style.cursor = "default";
  }
}
