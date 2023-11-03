import { Injectable, inject } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";
import { copy, remove } from "fs-extra";
import path from "path";

@Injectable({
  providedIn: "root",
})
export class TerrImageService {
  private configService = inject(ConfigService);

  constructor() {}

  saveImage(imagePath: string, id: string) {
    copy(imagePath, path.join(this.configService.terrImagesPath, id));
  }

  deleteImage(id) {
    remove(path.join(this.configService.terrImagesPath, id));
  }
}
