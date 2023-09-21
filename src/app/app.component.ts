import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ConfigService } from "app/config/service/config.service";
import { NoteService } from "app/note/service/note.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";

import { Component, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { PdfService } from "./services/pdf.service";
import { RouterOutlet } from "@angular/router";
import { NavigationComponent } from "./navigation/navigation.component";
import { SheetTitleService } from "./sheet-title/service/sheet-title.service";
import { TerritoryService } from "./map/territory/service/territory.service";
import { TerritoryGroupService } from "./map/territory-group/service/territory-group.service";
import { OnlineService } from "app/online/service/online.service";
import { PolygonService } from "./map/territory/service/polygon.service";
import { PublicThemeService } from "./public-theme/service/public-theme.service";
import { readdirSync } from "fs-extra";
import path from "path";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: true,
  imports: [NavigationComponent, RouterOutlet, NgIf],
})
export class AppComponent implements OnInit {
  //Flag to render the app when the paths are resolved (online or offline)
  pathsResolved = false;

  constructor(
    private configService: ConfigService,
    private onlineService: OnlineService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private noteService: NoteService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private sheetTitleService: SheetTitleService,
    private publicThemeService: PublicThemeService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private pdfService: PdfService,
    private territoryService: TerritoryService,
    private territoryGroupService: TerritoryGroupService,
    private polygonService: PolygonService
  ) {
    //Get only svg files and then get only the name part (without extension)
    const files = readdirSync(this.configService.iconsFilesPath)
      .filter((file) => path.extname(file).toLowerCase() === ".svg")
      .map((file) => path.parse(file).name);
    //Register all svg icons
    for (let file of files) {
      this.matIconRegistry.addSvgIcon(
        file,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          path.join(this.configService.iconsFilesPath, file + ".svg")
        )
      );
    }
    for (const file of files) {
      this.matIconRegistry.getNamedSvgIcon(file).subscribe();
    }
  }

  ngOnInit() {
    this.pdfService.registerOnLangChange();
    const online = this.onlineService.getOnline();
    this.pathsResolved = this.configService.prepareFilePaths(online); //1
    this.assignmentService.getAssignments();
    this.configService.getConfig(); //2
    this.roomService.getRooms();
    this.assignTypeService.getAssignTypes();
    this.noteService.getNotes();
    this.participantService.getParticipants();
    this.sheetTitleService.getTitles();
    this.participantService.getParticipants();
    this.sheetTitleService.getTitles();
    this.publicThemeService.getPublicThemes();
    this.territoryService.getTerritories();
    this.territoryGroupService.getTerritoryGroups();
    this.polygonService.getPolygons();
  }
}
