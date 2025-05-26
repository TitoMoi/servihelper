import { Injectable } from "@angular/core";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";
import { S13TerritoryEntry } from "app/map/model/map.model";
import { ConfigService } from "app/config/service/config.service";
import { readFileSync } from "fs-extra";
import path from "path";

@Injectable({
  providedIn: "root",
})
export class WordService {
  config = this.configService.getConfig();

  constructor(private configService: ConfigService) {}

  generateS13(serviceYear: string, entries: S13TerritoryEntry[]) {
    const content = readFileSync(
      path.join(this.configService.sourceFilesPath, "templates", "S-13.docx"),
    );

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: false,
    });
    doc.render({
      title_i18n: this.config.s13Title,
      year_service_i18n: this.config.s13YearService,
      year_service: serviceYear,
      terr_number_i18n: this.config.s13TerrNumber,
      last_completed_date_i18n: this.config.s13LastCompletedDate,
      assigned_to_i18n: this.config.s13AssignedTo,
      assigned_date_i18n: this.config.s13AssignedDate,
      completed_date_i18n: this.config.s13CompletedDate,
      entries,
    });
    const out = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    // Output the document using Data-URI
    saveAs(out, "S13.docx");
  }
}
