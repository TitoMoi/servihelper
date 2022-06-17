import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ConfigService } from "app/config/service/config.service";
import { NoteService } from "app/note/service/note.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { ElectronService } from "app/services/electron.service";
import { toPng } from "html-to-image";
import { AssignmentInterface } from "../model/assignment.model";
import { AssignmentService } from "../service/assignment.service";

@Component({
  selector: "app-multiple-image-assignment",
  templateUrl: "./multiple-image-assignment.component.html",
  styleUrls: ["./multiple-image-assignment.component.scss"],
})
export class MultipleImageAssignmentComponent implements OnInit, OnChanges {
  @Input("startDate") startDate: Date;
  @Input("endDate") endDate: Date;
  @Input("assignTypes") assignTypes: string[];
  @Input("order") order: string;

  #assignments: AssignmentInterface[] = [];

  assignmentsWithNames: AssignmentInterface[] = [];

  assignmentHeaderTitle = this.configService.getConfig().assignmentHeaderTitle;

  icons: string[] = ["pdf", "printer"];

  constructor(
    public assignTypeService: AssignTypeService,
    private roomService: RoomService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private noteService: NoteService,
    private configService: ConfigService,
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.startDate && this.endDate && this.assignTypes) {
      this.#assignments = [];
      this.filterAssignments();
      this.prepareAssignmentsData();
    }
  }

  ngOnInit(): void {}

  /**
   * Filters the assignments based on the range date and assign types
   */
  filterAssignments() {
    this.#assignments = this.assignmentService
      .getAssignments(true)
      .filter((assignment) => this.assignTypes.includes(assignment.assignType))
      .filter(
        (assignment) =>
          new Date(assignment.date) >= new Date(this.startDate) &&
          new Date(assignment.date) <= new Date(this.endDate)
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
        principal: this.participantService.getParticipant(a.principal).name,
        assistant: this.participantService.getParticipant(a.assistant)?.name,
        room: this.roomService.getRoom(a.room).name,
        assignType: this.assignTypeService.getAssignType(a.assignType).name,
        footerNote: this.noteService.getNote(a.footerNote)?.editorHTML,
        theme: a.theme,
        onlyMan: undefined,
        onlyWoman: undefined,
      };
      this.assignmentsWithNames.push(assignmentWithData);
    });
  }

  /**
   * Download a pdf from the image
   */
  async toPdf() {
    const micronMeasure = 60;
    //the div
    document.body.style.cursor = "wait";
    const div = document.getElementById("assignmentDiv");
    const dataUrl = await toPng(div);

    //create window
    const win = new this.electronService.remote.BrowserWindow({
      width: div.offsetWidth,
      height: div.offsetHeight,
      show: false,
    });

    await win.loadURL(dataUrl);

    const pdfOptions = {
      marginsType: 1,
      pageSize: {
        width: div.offsetWidth * micronMeasure,
        height: div.offsetHeight * micronMeasure, //1px = 264.5833 microns (meassure units)
      },
      printBackground: false,
      printSelectionOnly: false,
      landscape: false,
    };

    win.webContents.printToPDF(pdfOptions).then((data) => {
      const blob = new Blob([data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", "assignments.pdf");
      link.click();
    });
    document.body.style.cursor = "default";
  }

  async toPrinter() {
    /*  window.print(); */
    //the div
    const div = document.getElementById("assignmentDiv");
    //create window
    const win = new this.electronService.remote.BrowserWindow({
      show: false,
      webPreferences: {
        javascript: true,
      },
    });

    await win.loadFile("assets/web/blank.html");

    await win.webContents.executeJavaScript(
      `document.getElementsByTagName('body')[0].innerHTML = \`${div.innerHTML}\` `
    );
    await win.webContents.executeJavaScript("window.print()");

    await win.webContents.executeJavaScript("window.close()");
  }
}
