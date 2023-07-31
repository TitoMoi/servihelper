import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ConfigService } from "app/config/service/config.service";
import { NoteService } from "app/note/service/note.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { toBlob } from "html-to-image";
import { filenamifyPath } from "filenamify";
const os = require("os");
const path = require("path");
import { shell } from "electron";

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
} from "@angular/core";

import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { ipcRenderer } from "electron";
import { ensureDirSync, ensureFileSync, removeSync, writeFileSync } from "fs-extra";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { MatButtonModule } from "@angular/material/button";
import { NgIf, NgFor } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";
import { SheetTitlePipe } from "app/sheet-title/pipe/sheet-title.pipe";
import { ExportService } from "app/services/export.service";

@Component({
  selector: "app-multiple-image-assignment",
  templateUrl: "./multiple-image-assignment.component.html",
  styleUrls: ["./multiple-image-assignment.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoModule,
    MatIconModule,
    MatTooltipModule,
    NgIf,
    MatButtonModule,
    NgFor,
    TranslocoLocaleModule,
    SheetTitlePipe,
  ],
})
export class MultipleImageAssignmentComponent implements OnChanges {
  @Input() selectedDates: Date[];
  @Input() assignTypes: string[];
  @Input() rooms: string[];
  @Input() order: string;

  assignmentsWithNames: AssignmentInterface[] = [];

  assignmentsInFolderCreated = false;

  //The user home
  homeDir = os.homedir();

  //Title bindings
  assignmentHeaderTitle = this.configService.getConfig().assignmentHeaderTitle;
  assignmentPrincipalTitle = this.configService.getConfig().assignmentPrincipalTitle;
  assignmentAssistantTitle = this.configService.getConfig().assignmentAssistantTitle;
  assignmentDateTitle = this.configService.getConfig().assignmentDateTitle;
  assignmentAssignTypeTitle = this.configService.getConfig().assignmentAssignTypeTitle;
  assignmentThemeTitle = this.configService.getConfig().assignmentThemeTitle;
  assignmentRoomTitle = this.configService.getConfig().assignmentRoomTitle;
  assignmentNoteTitle = this.configService.getConfig().assignmentNoteTitle;

  #assignments: AssignmentInterface[] = [];

  constructor(
    public assignTypeService: AssignTypeService,
    private roomService: RoomService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private noteService: NoteService,
    private configService: ConfigService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(): void {
    if (this.selectedDates.length && this.assignTypes) {
      this.#assignments = [];
      this.assignmentsWithNames = [];
      this.filterAssignments().then(() => {
        this.prepareAssignmentsData();
        this.cdr.detectChanges();
      });
    }
  }

  /**
   * Filters the assignments based on the range date and assign types
   */
  async filterAssignments() {
    this.#assignments = await this.assignmentService.getAssignments();

    this.#assignments = this.#assignments.filter(
      (assignment) =>
        this.assignTypes.includes(assignment.assignType) &&
        this.rooms.includes(assignment.room) &&
        this.selectedDates.some(
          (date) => new Date(date).getTime() === new Date(assignment.date).getTime()
        )
    );
  }

  /**
   * Change assignments Ids to names and data
   */
  prepareAssignmentsData() {
    this.#assignments.forEach((a) => {
      const assignmentWithData: AssignmentInterface = {
        id: a.id,
        date: a.date,
        sheetTitle: a.sheetTitle,
        principal: this.participantService.getParticipant(a.principal).name,
        assistant: this.participantService.getParticipant(a.assistant)?.name,
        room: this.roomService.getRoom(a.room).name,
        assignType: this.assignTypeService.getAssignType(a.assignType).name,
        footerNote: this.noteService.getNote(a.footerNote)?.editorHTML,
        theme: a.theme,
        onlyMan: undefined,
        onlyWoman: undefined,
        onlyExternals: undefined,
        group: undefined,
      };
      this.assignmentsWithNames.push(assignmentWithData);
    });

    //Sort
    if (this.order === "Desc") {
      this.assignmentsWithNames = this.assignmentsWithNames.sort(
        this.assignmentService.sortAssignmentsByDateDesc
      );
    } else {
      this.assignmentsWithNames = this.assignmentsWithNames.sort(
        this.assignmentService.sortAssignmentsByDateAsc
      );
    }
    this.cdr.detectChanges();
  }

  async toPng() {
    this.exportService.toPng("assignmentDiv", "assignments");
  }

  /**
   * Send to main the creation of new window and print div
   */
  async createHiddenWindowForPrint() {
    //the div
    const div: HTMLDivElement = document.getElementById("assignmentDiv") as HTMLDivElement;
    //create window
    await ipcRenderer.send("createHiddenWindowForPrint", {
      innerHTML: div.innerHTML,
    });
  }

  async imageToBlob(): Promise<Blob> {
    //the div
    document.body.style.cursor = "wait";
    const div = document.getElementById("assignmentDiv");
    const dataBlob = await toBlob(div);
    document.body.style.cursor = "default";
    return dataBlob;
  }

  async createAssignmentsInFolder() {
    this.assignmentsInFolderCreated = false;
    const assignmentsWithNamesBK = structuredClone(this.assignmentsWithNames);
    const div: HTMLDivElement = document.getElementById("assignmentDiv") as HTMLDivElement;
    div.classList.remove("col-xl-6");
    div.classList.add("col-xl-3");
    div.classList.remove("col");
    div.classList.add("col-6");
    //Create a map for every name and their assignments
    const assignByNameMap = new Map<string, AssignmentInterface[]>();
    for (const a of this.assignmentsWithNames) {
      if (assignByNameMap.has(a.principal)) {
        const assignments = assignByNameMap.get(a.principal);
        assignments.push(a);
        assignByNameMap.set(a.principal, assignments);
      } else {
        assignByNameMap.set(a.principal, [a]);
      }
    }

    //Clean directory "assignments" first
    removeSync(filenamifyPath(path.join(this.homeDir, "assignments")));

    for (const [key, assignments] of assignByNameMap.entries()) {
      //Ensure participant folder name
      const pathName = filenamifyPath(path.join(this.homeDir, "assignments", key));
      //Create again
      ensureDirSync(pathName);
      for (const a of assignments) {
        //update the UI with only 1 assignment each time
        this.assignmentsWithNames = [a];
        this.cdr.detectChanges();
        //Ensure the filename is valid for the system
        const fileName = filenamifyPath(
          path.join(this.homeDir, "assignments", key, a.assignType + ".png")
        );
        ensureFileSync(fileName);
        //Create the blob and save it to the fs
        const blob = await this.imageToBlob();
        const ab = await blob.arrayBuffer();
        const view = new Uint8Array(ab);
        writeFileSync(fileName, view);
      }
    }
    //restore width
    div.classList.remove("col-xl-3");
    div.classList.add("col-xl-6");
    div.classList.remove("col-6");
    div.classList.add("col");

    //Restore assignments view
    this.assignmentsWithNames = assignmentsWithNamesBK;
    this.assignmentsInFolderCreated = true;
    this.cdr.detectChanges();
  }

  openAssignmentsFolder() {
    shell.openPath(path.join(this.homeDir, "assignments"));
  }
}
