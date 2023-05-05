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

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: true,
  imports: [NavigationComponent, RouterOutlet],
})
export class AppComponent implements OnInit {
  //Icons
  icons: string[] = [
    "avatar",
    "menu",
    "room",
    "abc",
    "notes",
    "participants",
    "assignment",
    "statistics",
    "config",
    "info",
    "garbage",
    "edit",
    "assignImage",
    "lists",
    "csvSvg",
    "search",
    "pdf",
    "pdfblue",
    "png",
    "printer",
    "excel",
    "googlecalendar",
    "colorpicker",
    "switch",
    "man",
    "woman",
    "calendar-delete",
    "folder",
    "warning",
    "info-blue",
  ];

  constructor(
    private configService: ConfigService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private noteService: NoteService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private pdfService: PdfService
  ) {
    //Register icons
    for (const iconFileName of this.icons) {
      this.matIconRegistry.addSvgIcon(
        iconFileName,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          "assets/icons/" + iconFileName + ".svg"
        )
      );
    }
    for (const iconFileName of this.icons) {
      this.matIconRegistry.getNamedSvgIcon(iconFileName).subscribe();
    }
  }

  ngOnInit() {
    this.pdfService.registerOnLangChange();
    this.configService.getConfig();
    this.roomService.getRooms();
    this.assignTypeService.getAssignTypes();
    this.noteService.getNotes();
    this.participantService.getParticipants();
    this.assignmentService.getAssignments();
  }
}
