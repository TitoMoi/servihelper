import { AssignmentInterface } from 'app/assignment/model/assignment.model';
import { AssignmentService } from 'app/assignment/service/assignment.service';
import { AssignTypeInterface } from 'app/assignType/model/assignType.model';
import { AssignTypeService } from 'app/assignType/service/assignType.service';
import { ConfigService } from 'app/config/service/config.service';
import { NoteInterface } from 'app/note/model/note.model';
import { NoteService } from 'app/note/service/note.service';
import { ParticipantInterface } from 'app/participant/model/participant.model';
import { ParticipantService } from 'app/participant/service/participant.service';
import { RoomInterface } from 'app/room/model/room.model';
import { RoomService } from 'app/room/service/room.service';
import { ElectronService } from 'app/services/electron.service';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

  copied = false;

  //Title bindings
  assignmentHeaderTitle = this.configService.getConfig().assignmentHeaderTitle;
  assignmentPrincipalTitle =
    this.configService.getConfig().assignmentPrincipalTitle;
  assignmentAssistantTitle =
    this.configService.getConfig().assignmentAssistantTitle;
  assignmentDateTitle = this.configService.getConfig().assignmentDateTitle;
  assignmentAssignTypeTitle =
    this.configService.getConfig().assignmentAssignTypeTitle;
  assignmentThemeTitle = this.configService.getConfig().assignmentThemeTitle;
  assignmentRoomTitle = this.configService.getConfig().assignmentRoomTitle;
  assignmentNoteTitle = this.configService.getConfig().assignmentNoteTitle;

  //Image data bindings
  date: Date;
  roomName: string;
  assignTypeName: string;
  principalName: string;
  assistantName: string;
  theme: string;
  footerNoteEditorHTML: string;

  constructor(
    private assignmentService: AssignmentService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private noteService: NoteService,
    private activatedRoute: ActivatedRoute,
    private electronService: ElectronService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    //Get the assignment
    const assignment = this.assignmentService.getAssignment(
      this.activatedRoute.snapshot.params.id
    );

    this.date = assignment.date;

    this.principalName = this.participantService.getParticipant(
      assignment.principal
    ).name;

    this.assistantName = this.participantService.getParticipant(
      assignment.assistant
    )?.name;

    this.roomName = this.roomService.getRoom(assignment.room).name;

    this.assignTypeName = this.assignTypeService.getAssignType(
      assignment.assignType
    ).name;

    this.footerNoteEditorHTML = this.noteService.getNote(
      assignment.footerNote
    )?.editorHTML;

    this.theme = assignment.theme;
  }

  /**
   * Copy image to the clipboard
   */
  async copyImageToClipboard() {
    document.body.style.cursor = "wait";
    const node = document.getElementById("assignmentTableId");
    const dataUrl = await toPng(node);
    const natImage =
      this.electronService.remote.nativeImage.createFromDataURL(dataUrl);
    this.electronService.remote.clipboard.writeImage(natImage, "selection");
    this.copied = true;
    document.body.style.cursor = "default";
  }

  async toPng() {
    //the div
    document.body.style.cursor = "wait";
    const div = document.getElementById("assignmentTableId");
    const dataUrl = await toPng(div);

    const link = document.createElement("a");
    link.href = dataUrl;
    link.setAttribute("download", "assignment.png");
    link.click();

    document.body.style.cursor = "default";
  }

  toPdf() {
    const doc = new jsPDF("portrait");
    autoTable(doc, {
      html: `#assignmentTableId`,
      didParseCell: (data) => {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const classList: DOMTokenList = data.cell.raw["classList"];
        if (classList.contains("bold")) {
          data.cell.styles.fontStyle = "bold";
        }
        data.cell.styles.fillColor = "#FFFFFF";
      },
    });

    doc.save("assignment.pdf");
  }
}
