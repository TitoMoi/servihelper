import { Injectable, inject } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";
import { writeFile } from "fs-extra";
import path from "path";

@Injectable({
  providedIn: "root",
})
export class TerrImageService {
  private configService = inject(ConfigService);

  constructor() {}

  /* getImage(id) {
    if (id) {
      const buffer = readFileSync(path.join(this.configService.terrImagesPath, id + ".png"));
      const imageBuffer = new ArrayBuffer(buffer.byteLength);
      const view = new Uint8Array(imageBuffer);
      for (let i = 0; i < buffer.length; ++i) {
        view[i] = imageBuffer[i];
      }
      return imageBuffer;
    }
  } */

  saveImage(image: ArrayBuffer, id: string) {
    const imageFile = new Uint8Array(image);
    writeFile(path.join(this.configService.terrImagesPath, id + ".png"), imageFile);
  }
}
