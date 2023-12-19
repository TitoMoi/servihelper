import AdmZip from "adm-zip";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ConfigService } from "app/config/service/config.service";
import { NoteService } from "app/note/service/note.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { lstatSync, writeFileSync, writeJsonSync } from "fs-extra";

import { Component, OnInit } from "@angular/core";
import { TranslocoService, TranslocoModule } from "@ngneat/transloco";
import { DateAdapter, NativeDateAdapter } from "@angular/material/core";
import { NgClass, AsyncPipe } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import path from "path";
import { PolygonService } from "app/map/territory/service/polygon.service";
import { TerritoryService } from "app/map/territory/service/territory.service";
import { TerritoryGroupService } from "app/map/territory-group/service/territory-group.service";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { PublicThemeService } from "app/public-theme/service/public-theme.service";
import { SheetTitleService } from "app/sheet-title/service/sheet-title.service";
import { OnlineService } from "app/online/service/online.service";
import { NoteInterface } from "app/note/model/note.model";
import { AssignTypeInterface } from "app/assigntype/model/assigntype.model";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  standalone: true,
  imports: [TranslocoModule, TranslocoLocaleModule, MatButtonModule, NgClass, AsyncPipe],
})
export class HomeComponent implements OnInit {
  // If zip is loaded and saved
  isZipLoaded = false;

  // If upload button is clicked
  upload = false;

  config$ = this.configService.config$;

  isOnline = this.onlineService.getOnline().isOnline;

  noteHome: NoteInterface;

  constructor(
    private configService: ConfigService,
    private onlineService: OnlineService,
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
  ngOnInit(): void {
    this.noteHome = this.noteService.getNotes().find((n) => n.showInHome);
  }

  downloadFiles() {
    const zip = new AdmZip();
    zip.addLocalFolder(this.configService.sourceFilesPath);

    const config = this.configService.getConfig();

    config.lastExportedDate = new Date();

    this.configService.updateConfig(config);

    zip.toBuffer((buffer: Buffer) => {
      const blob = new Blob([buffer], { type: "application/octet" });
      const zipLink = document.createElement("a");
      zipLink.href = window.URL.createObjectURL(blob);
      //No extension to prevent mac to auto unzip folder
      zipLink.setAttribute("download", "servihelper-files");
      zipLink.click();
    });
  }

  getZipContentFromFileEvent(event: Event) {
    const target = event.target as HTMLInputElement;
    return target.files[0];
  }

  /** Uploads servihelper files, only for OFFLINE */
  uploadZipFiles(event: Event) {
    //Add the current assignTypes that are not on the final list
    const nonExistingAssignmentTypes: AssignTypeInterface[] = [];

    const zipFile = this.getZipContentFromFileEvent(event);
    /* let zip = new AdmZip();
    zip = zip.readFile(zipFile.path); */
    const zip = new AdmZip(zipFile.path);

    //First of all prepare the paths, online file is already available
    this.configService.prepareFilePaths({ isOnline: false, path: "" });
    // reading archives
    zip.getEntries().forEach((zipEntry) => {
      switch (
        zipEntry.entryName //entryName = participant.json, assignment.gz, images/ ...
      ) {
        case this.configService.configFilename:
          const currentConfig = this.configService.getConfig(); //Default config
          const incomingConfig = JSON.parse(zipEntry.getData().toString("utf8"));
          let finalConfig = { ...currentConfig, ...incomingConfig };
          writeJsonSync(this.configService.configPath, finalConfig);
          break;
        case this.configService.assignTypesFilename:
          const incomingAtList: AssignTypeInterface[] = JSON.parse(
            zipEntry.getData().toString("utf8")
          );
          //Read current assignTypes
          const currentAtList = this.assignTypeService.getAssignTypes();

          //Update current assignTypes with incoming assignTypes
          const finalAtList = incomingAtList.map((incomingAt) => {
            const currentAt = currentAtList.find((at) => at.id === incomingAt.id);
            return { ...currentAt, ...incomingAt } as AssignTypeInterface; //updates or adds
          });

          for (const at of currentAtList) {
            const exists = finalAtList.some((fat) => fat.id === at.id);
            if (!exists) {
              finalAtList.push(at);
              nonExistingAssignmentTypes.push(at);
            }
          }

          //save it
          finalAtList.sort((a, b) => (a.order > b.order ? 1 : -1));
          writeJsonSync(this.configService.assignTypesPath, finalAtList);
          break;
        default:
          const destinyPath = path.join(
            this.configService.sourceFilesPath,
            zipEntry.entryName
          );

          const stats = lstatSync(destinyPath, { throwIfNoEntry: false });

          if (stats?.isFile()) {
            const data = (zipEntry.entryName as string).endsWith(".gz")
              ? zipEntry.getData()
              : zipEntry.getData().toString("utf8");
            writeFileSync(destinyPath, data);
          }
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

    //If we have some new assign type we need to add the reference to all the participants
    if (nonExistingAssignmentTypes.length) {
      //Read current participants reference
      const participants = this.participantService.getParticipants();
      for (const p of participants) {
        for (const at of nonExistingAssignmentTypes) {
          p.assignTypes.push({
            assignTypeId: at.id,
            canPrincipal: true,
            canAssistant: true,
          });
        }
      }
      this.participantService.saveParticipantsToFile();
    }

    this.isZipLoaded = true;
  }
}
