import AdmZip from "adm-zip";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ConfigService } from "app/config/service/config.service";
import { NoteService } from "app/note/service/note.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { ElectronService } from "app/services/electron.service";
import { APP_CONFIG } from "environments/environment";
import * as fs from "fs-extra";

import { Component } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";
import { DateAdapter, NativeDateAdapter } from "@angular/material/core";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent {
  // If zip is loaded and saved
  isZipLoaded = false;

  // If upload button is clicked
  upload = false;

  // the filesystem api
  fs: typeof fs = this.electronService.remote.require("fs-extra");

  // The path of the app
  path: string;

  constructor(
    private configService: ConfigService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private noteService: NoteService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private translocoService: TranslocoService,
    private dateAdapter: DateAdapter<NativeDateAdapter>,
    private electronService: ElectronService
  ) {
    this.path = APP_CONFIG.production
      ? //__dirname is where the .json files exists
        __dirname + "/assets/source"
      : "./assets/source";
  }

  downloadFiles() {
    const zip = new AdmZip();

    zip.addLocalFolder(this.path);

    zip.toBuffer((buffer: Buffer) => {
      const today = new Date(Date.now());
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
        case "assignment.json":
          this.fs.writeFile(
            this.path + "/assignment.json",
            zipEntry.getData().toString("utf8")
          );
          break;
        case "participant.json":
          this.fs.writeFile(
            this.path + "/participant.json",
            zipEntry.getData().toString("utf8")
          );
          break;
        case "room.json":
          this.fs.writeFile(
            this.path + "/room.json",
            zipEntry.getData().toString("utf8")
          );
          break;
        case "assignType.json":
          this.fs.writeFile(
            this.path + "/assignType.json",
            zipEntry.getData().toString("utf8")
          );
          break;
        case "note.json":
          this.fs.writeFile(
            this.path + "/note.json",
            zipEntry.getData().toString("utf8")
          );
          break;
        case "config.json":
          this.fs.writeFile(
            this.path + "/config.json",
            zipEntry.getData().toString("utf8")
          );
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
