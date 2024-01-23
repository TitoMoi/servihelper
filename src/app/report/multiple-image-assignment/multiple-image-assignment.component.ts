import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ConfigService } from "app/config/service/config.service";
import { NoteService } from "app/note/service/note.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { PublicThemeService } from "app/public-theme/service/public-theme.service";
import { toBlob } from "html-to-image";
import { filenamifyPath } from "filenamify";
import * as path from "path";
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
import { ensureFileSync, removeSync, writeFile } from "fs-extra";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { MatButtonModule } from "@angular/material/button";
import { AsyncPipe } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";
import { SheetTitlePipe } from "app/sheet-title/pipe/sheet-title.pipe";
import { ExportService } from "app/services/export.service";
import { PublicThemePipe } from "app/public-theme/pipe/public-theme.pipe";
import { MatChipsModule } from "@angular/material/chips";
import { PdfService } from "app/services/pdf.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

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
    MatButtonModule,
    TranslocoLocaleModule,
    SheetTitlePipe,
    PublicThemePipe,
    MatChipsModule,
    MatProgressSpinnerModule,
    AsyncPipe,
  ],
})
export class MultipleImageAssignmentComponent implements OnChanges {
  @Input() selectedDates: Date[];
  @Input() assignTypes: string[];
  @Input() rooms: string[];
  @Input() order: string;

  assignmentsWithNames: AssignmentInterface[] = [];

  assignmentsInFolderCreated = false;
  showSpinner = false;

  homeDir = this.configService.homeDir;

  existsAssignmentsForS89 = false;

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
    private publicThemeService: PublicThemeService,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef,
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

  hasAssignments() {
    return this.#assignments.length;
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
          (date) => new Date(date).getTime() === new Date(assignment.date).getTime(),
        ),
    );
  }

  /**
   * Change assignments Ids to names and data
   */
  prepareAssignmentsData() {
    for (const a of this.#assignments) {
      const assignmentWithData: AssignmentInterface = {
        id: a.id,
        date: a.date,
        sheetTitle: a.sheetTitle,
        principal: this.participantService.getParticipant(a.principal).name,
        assistant: this.participantService.getParticipant(a.assistant)?.name,
        room: this.roomService.getNameOrTranslation(this.roomService.getRoom(a.room)),
        assignType: this.assignTypeService.getNameOrTranslation(
          this.assignTypeService.getAssignType(a.assignType),
        ),
        footerNote: this.noteService.getNote(a.footerNote)?.editorHTML,
        theme: a.isPTheme ? this.publicThemeService.getPublicTheme(a.theme)?.name : a.theme,
        isPTheme: a.isPTheme,
        onlyMan: undefined,
        onlyWoman: undefined,
        onlyExternals: undefined,
        group: undefined,
      };
      this.assignmentsWithNames.push(assignmentWithData);
    }

    //Sort
    if (this.order === "Desc") {
      this.assignmentsWithNames = this.assignmentsWithNames.sort(
        this.assignmentService.sortAssignmentsByDateDesc,
      );
    } else {
      this.assignmentsWithNames = this.assignmentsWithNames.sort(
        this.assignmentService.sortAssignmentsByDateAsc,
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

  /** Native slips and png images */
  async createAssignmentsInFolder() {
    this.showSpinner = true;
    this.assignmentsInFolderCreated = false;
    const assignmentsWithNamesBK = structuredClone(this.assignmentsWithNames);
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

    const promises = [];
    for (const [key, assignments] of assignByNameMap.entries()) {
      for (const [index, a] of assignments.entries()) {
        //update the UI with only 1 assignment each time
        this.assignmentsWithNames = [a];
        this.cdr.detectChanges();
        //Ensure the filename is valid for the system
        const fileName = filenamifyPath(
          path.join(this.homeDir, "assignments", key, index + "-" + a.assignType + ".png"),
        );
        ensureFileSync(fileName);
        //Create the blob and save it to the fs
        const blob = await this.imageToBlob();
        const ab = await blob.arrayBuffer();
        const view = new Uint8Array(ab);
        promises.push(writeFile(fileName, view));
      }
    }
    await Promise.all([...promises]);
    //Restore assignments view
    this.assignmentsWithNames = assignmentsWithNamesBK;
    this.assignmentsInFolderCreated = true;
    this.showSpinner = false;
    this.cdr.detectChanges();
  }

  /**
   * Create a pdf for each assignment in a folder for each participant
   */
  async toPdfS89() {
    this.showSpinner = true;
    this.assignmentsInFolderCreated = false;
    //Clean directory "assignments" first
    removeSync(filenamifyPath(path.join(this.homeDir, "assignments")));

    const promises = [];
    for (const [index, a] of this.#assignments.entries()) {
      const pdfBytes = await this.pdfService.toPdfS89([a], false);
      const participantName = this.participantService.getParticipant(a.principal).name;
      const assignTypeName = this.assignTypeService.getNameOrTranslation(
        this.assignTypeService.getAssignType(a.assignType),
      );

      //Get the filename path and ensure it's valid for the system
      const fileNamePath = filenamifyPath(
        path.join(
          this.homeDir,
          "assignments",
          participantName,
          index + "-" + assignTypeName + ".pdf",
        ),
      );
      ensureFileSync(fileNamePath);
      promises.push(writeFile(fileNamePath, new Uint8Array(await pdfBytes.arrayBuffer())));
    }
    await Promise.all([...promises]);
    this.assignmentsInFolderCreated = true;
    this.showSpinner = false;
    this.cdr.detectChanges();
  }

  /**
   * Create a single pdf containing all the assignments
   */
  async toPdfS89M() {
    this.showSpinner = true;
    this.assignmentsInFolderCreated = false;
    //Clean directory "assignments" first
    removeSync(filenamifyPath(path.join(this.homeDir, "assignments")));

    //the s89m will all the assignments
    const pdfBytes = await this.pdfService.toPdfS89(this.#assignments, true);

    //Ensure the filename is valid for the system
    const fileNamePath = filenamifyPath(
      path.join(this.homeDir, "assignments", this.pdfService.S89M),
    );
    ensureFileSync(fileNamePath);

    writeFile(fileNamePath, new Uint8Array(await pdfBytes.arrayBuffer())).then(() => {
      this.assignmentsInFolderCreated = true;
      this.showSpinner = false;
      this.cdr.detectChanges();
    });
  }

  openAssignmentsFolder() {
    shell.openPath(path.join(this.homeDir, "assignments"));
  }
}
