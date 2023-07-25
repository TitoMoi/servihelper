import AdmZip from "adm-zip";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ConfigService } from "app/config/service/config.service";
import { NoteService } from "app/note/service/note.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { writeFileSync } from "fs-extra";

import { Component } from "@angular/core";
import { TranslocoService, TranslocoModule } from "@ngneat/transloco";
import { DateAdapter, NativeDateAdapter } from "@angular/material/core";
import { NgIf, NgClass } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import path from "path";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  standalone: true,
  imports: [TranslocoModule, MatButtonModule, NgIf, NgClass],
})
export class HomeComponent {
  // If zip is loaded and saved
  isZipLoaded = false;

  // If upload button is clicked
  upload = false;

  constructor(
    private configService: ConfigService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private noteService: NoteService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private translocoService: TranslocoService,
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
      switch (zipEntry.entryName) {
        case this.configService.assignmentsFilename:
          writeFileSync(
            this.configService.assignmentsPath,
            zipEntry.getData().toString("utf8")
          );
          break;
        case this.configService.participantsFilename:
          writeFileSync(
            this.configService.participantsPath,
            zipEntry.getData().toString("utf8")
          );
          break;
        case this.configService.roomsFilename:
          writeFileSync(this.configService.roomsPath, zipEntry.getData().toString("utf8"));
          break;
        case this.configService.assignTypesFilename:
          writeFileSync(
            this.configService.assignTypesPath,
            zipEntry.getData().toString("utf8")
          );
          break;
        case this.configService.notesFilename:
          writeFileSync(this.configService.notesPath, zipEntry.getData().toString("utf8"));
          break;
        case this.configService.sheetTitleFilename:
          writeFileSync(
            this.configService.sheetTitlePath,
            zipEntry.getData().toString("utf8")
          );
          break;
        case this.configService.territoriesFilename:
          writeFileSync(
            this.configService.territoriesPath,
            zipEntry.getData().toString("utf8")
          );
          break;
        case this.configService.polygonsFilename:
          writeFileSync(this.configService.polygonsPath, zipEntry.getData().toString("utf8"));
          break;
        case this.configService.territoryGroupsFilename:
          writeFileSync(
            this.configService.territoryGroupsPath,
            zipEntry.getData().toString("utf8")
          );
          break;
        case this.configService.configFilename:
          const currentConfig = this.configService.getConfig(); //Default config
          const incomingConfig = JSON.parse(zipEntry.getData().toString("utf8"));
          const finalConfig = { ...currentConfig, ...incomingConfig };
          writeFileSync(this.configService.configPath, JSON.stringify(finalConfig));
          break;
      }
    });

    this.configService.hasChanged = true;
    this.roomService.hasChanged = true;
    this.assignTypeService.hasChanged = true;
    this.assignmentService.hasChanged = true;
    this.participantService.hasChanged = true;
    this.noteService.hasChanged = true;
    this.configService.getConfig();
    this.roomService.getRooms();
    this.assignTypeService.getAssignTypes();
    this.noteService.getNotes();
    this.participantService.getParticipants();
    this.assignmentService.getAssignments();

    let lang = this.configService.getConfig().lang;
    this.translocoService = this.translocoService.setActiveLang(lang);
    if (lang === "zhCN") lang = "zh";
    this.dateAdapter.setLocale(lang);

    this.isZipLoaded = true;
  }
}
