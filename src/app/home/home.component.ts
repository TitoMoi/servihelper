import AdmZip from "adm-zip";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ConfigService } from "app/config/service/config.service";
import { NoteService } from "app/note/service/note.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { writeFileSync, writeJsonSync } from "fs-extra";

import { Component } from "@angular/core";
import { TranslocoService, TranslocoModule } from "@ngneat/transloco";
import { DateAdapter, NativeDateAdapter } from "@angular/material/core";
import { NgIf, NgClass, AsyncPipe } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import path from "path";
import { PolygonService } from "app/map/territory/service/polygon.service";
import { TerritoryService } from "app/map/territory/service/territory.service";
import { TerritoryGroupService } from "app/map/territory-group/service/territory-group.service";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { PublicThemeService } from "app/public-theme/service/public-theme.service";
import { SheetTitleService } from "app/sheet-title/service/sheet-title.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  standalone: true,
  imports: [TranslocoModule, TranslocoLocaleModule, MatButtonModule, NgIf, NgClass, AsyncPipe],
})
export class HomeComponent {
  // If zip is loaded and saved
  isZipLoaded = false;

  // If upload button is clicked
  upload = false;

  config$ = this.configService.config$;

  constructor(
    private configService: ConfigService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private noteService: NoteService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private publicThemeService: PublicThemeService,
    private sheetTitleService: SheetTitleService,
    private translocoService: TranslocoService,
    private polygonService: PolygonService,
    private territoryService: TerritoryService,
    private territoryGroupService: TerritoryGroupService,
    private dateAdapter: DateAdapter<NativeDateAdapter>
  ) {}

  downloadFiles() {
    const zip = new AdmZip();
    zip.addLocalFolder(path.join(this.configService.sourceFilesPath));

    zip.toBuffer((buffer: Buffer) => {
      const blob = new Blob([buffer], { type: "application/octet" });
      const zipLink = document.createElement("a");
      zipLink.href = window.URL.createObjectURL(blob);
      //With .rar extension to prevent mac to auto unzip folder
      zipLink.setAttribute("download", "servihelper-files");
      zipLink.click();
    });
  }

  getZipContentFromFileEvent(event: Event) {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    return target.files[0];
  }

  uploadZipFiles(event: Event) {
    const zipFile = this.getZipContentFromFileEvent(event);
    const zip = new AdmZip(zipFile.path);
    // reading archives
    zip.getEntries().forEach((zipEntry) => {
      switch (
        zipEntry.entryName //entryName = participant.json...etc
      ) {
        case this.configService.configFilename:
          const currentConfig = this.configService.getConfig(); //Default config
          const incomingConfig = JSON.parse(zipEntry.getData().toString("utf8"));
          let finalConfig = { ...currentConfig, ...incomingConfig };
          writeJsonSync(this.configService.configPath, finalConfig);
          break;
        default:
          writeFileSync(
            path.join(this.configService.sourceFilesPath, zipEntry.entryName),
            zipEntry.getData().toString("utf8")
          );
      }
    });

    this.configService.hasChanged = true;
    const config = this.configService.getConfig();
    //Update last imported date and filename
    config.lastImportedDate = new Date();
    config.lastImportedFilename = zipFile.name;
    this.configService.updateConfig(config);

    this.roomService.hasChanged = true;
    this.assignTypeService.hasChanged = true;
    this.assignmentService.hasChanged = true;
    this.participantService.hasChanged = true;
    this.sheetTitleService.hasChanged = true;
    this.publicThemeService.hasChanged = true;
    this.noteService.hasChanged = true;
    this.polygonService.hasChanged = true;
    this.territoryService.hasChanged = true;
    this.territoryGroupService.hasChanged = true;
    this.roomService.getRooms();
    this.assignTypeService.getAssignTypes();
    this.noteService.getNotes();
    this.sheetTitleService.getTitles();
    this.publicThemeService.getPublicThemes();
    this.participantService.getParticipants();
    this.assignmentService.getAssignments();
    this.polygonService.getPolygons();
    this.territoryService.getTerritories();
    this.territoryGroupService.getTerritoryGroups();

    let lang = this.configService.getConfig().lang;
    this.translocoService = this.translocoService.setActiveLang(lang);
    if (lang === "zhCN") lang = "zh";
    this.dateAdapter.setLocale(lang);

    this.isZipLoaded = true;
  }
}
