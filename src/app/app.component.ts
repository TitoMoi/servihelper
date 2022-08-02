import { AssignmentService } from 'app/assignment/service/assignment.service';
import { AssignTypeService } from 'app/assignType/service/assignType.service';
import { ConfigService } from 'app/config/service/config.service';
import { NoteService } from 'app/note/service/note.service';
import { ParticipantService } from 'app/participant/service/participant.service';
import { RoomService } from 'app/room/service/room.service';
import * as fs from 'fs-extra';

import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { ElectronService } from './services/electron.service';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  // Filesystem api
  fs: typeof fs = this.electronService.remote.require("fs-extra");

  //Icons
  icons: string[] = [
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
    "png",
    "printer",
    "excel",
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
    private electronService: ElectronService
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
    this.configService.getConfig();
    this.roomService.getRooms();
    this.assignTypeService.getAssignTypes();
    this.noteService.getNotes();
    this.participantService.getParticipants();
    this.assignmentService.getAssignments();
  }
}
