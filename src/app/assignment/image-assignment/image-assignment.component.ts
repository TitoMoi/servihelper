import { Component, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ConfigService } from "app/config/service/config.service";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { ParticipantInterface } from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";
import { ElectronService } from "app/services/electron.service";
import { toPng } from "html-to-image";

@Component({
  selector: "app-image-assignment",
  templateUrl: "./image-assignment.component.html",
  styleUrls: ["./image-assignment.component.css"],
})
export class ImageAssignmentComponent implements OnInit {
  rooms: RoomInterface[];
  assignTypes: AssignTypeInterface[];
  principalList: ParticipantInterface[];
  assistantList: ParticipantInterface[];
  footerNotes: NoteInterface[];
  assignments: AssignmentInterface[];

  icons: string[];

  copied;
  isLoaded;
  pdfOptions;
  micronMeasure;

  //Image data bindings
  assignmentHeaderTitle: string;
  date: Date;
  room: string;
  assignType: string;
  principal: string;
  assistant: string;
  theme: string;
  footerNote: string;

  constructor(
    private assignmentService: AssignmentService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private noteService: NoteService,
    private activatedRoute: ActivatedRoute,
    private electronService: ElectronService,
    private configService: ConfigService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.copied = false;
    this.isLoaded = false;
    this.micronMeasure = 264.5833;
    this.icons = ["pdf", "png"];

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

  ngOnInit() {
    this.activatedRoute.params.subscribe(async (params) => {
      //Fill the form with the assignment passed by the router
      const id = params.id;

      //Get the assignment
      const assignment = await this.assignmentService.getAssignment(id);

      //principal
      const principalPromise = this.participantService.getParticipant(
        assignment.principal
      );
      //assistant is optional
      const assistantPromise = this.participantService.getParticipant(
        assignment.assistant
      );
      //room
      const roomPromise = this.roomService.getRoom(assignment.room);
      //assignType
      const assignTypePromise = this.assignTypeService.getAssignType(
        assignment.assignType
      );
      const footerNotePromise = this.noteService.getNote(assignment.footerNote); //Note is optional

      const values = await Promise.all([
        principalPromise,
        assistantPromise,
        roomPromise,
        assignTypePromise,
        footerNotePromise,
      ]);

      //bindings
      this.assignmentHeaderTitle =
        this.configService.getConfig().assignmentHeaderTitle;

      this.date = assignment.date;
      if (assignment.theme) {
        this.theme = assignment.theme;
      }
      this.principal = values[0].name;
      if (values[1]) {
        this.assistant = values[1].name;
      }
      this.room = values[2].name;
      this.assignType = values[3].name;
      if (values[4]) {
        this.footerNote = values[4].editorHTML;
      }

      this.isLoaded = true;
    });
  }

  getRooms(): RoomInterface[] {
    return this.roomService.getRooms();
  }

  getAssignTypes(): AssignTypeInterface[] {
    return this.assignTypeService.getAssignTypes();
  }

  getParticipants(): ParticipantInterface[] {
    return this.participantService.getParticipants();
  }

  getAssignments(): AssignmentInterface[] {
    return this.assignmentService.getAssignments();
  }

  getFooterNotes(): NoteInterface[] {
    return this.noteService.getNotes();
  }

  /**
   * Copy image to the clipboard
   */
  async copyImage() {
    document.body.style.cursor = "wait";
    const node = document.getElementById("assignmentDiv");
    const dataUrl = await toPng(node);
    const natImage =
      this.electronService.remote.nativeImage.createFromDataURL(dataUrl);
    this.electronService.remote.clipboard.writeImage(natImage, "selection");
    this.copied = true;
    document.body.style.cursor = "default";
  }

  async toPng() {
    document.body.style.cursor = "wait";
    const node = document.getElementById("assignmentDiv");
    const dataUrl = await toPng(node);

    const link = document.createElement("a");
    link.href = dataUrl;
    link.setAttribute("download", "image.png");
    link.click();

    document.body.style.cursor = "default";
  }

  /**
   * Download a pdf from the image
   */
  async toPdf() {
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

    this.pdfOptions = {
      marginsType: 1,
      pageSize: {
        width: div.offsetWidth * this.micronMeasure,
        height: div.offsetHeight * this.micronMeasure, //1px = 264.5833 microns (meassure units)
      },
      printBackground: false,
      printSelectionOnly: false,
      landscape: false,
    };

    win.webContents.printToPDF(this.pdfOptions).then((data) => {
      const blob = new Blob([data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", "assignment.pdf");
      link.click();
    });
    document.body.style.cursor = "default";
  }
}
