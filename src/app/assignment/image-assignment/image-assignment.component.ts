/* eslint-disable @typescript-eslint/naming-convention */
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { ConfigService } from "app/config/service/config.service";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { ParticipantInterface } from "app/participant/model/participant.model";
import { RoomInterface } from "app/room/model/room.model";
import { toPng } from "html-to-image";
import autoTable from "jspdf-autotable";

import { ChangeDetectorRef, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PdfService } from "app/services/pdf.service";
import { clipboard, nativeImage, NativeImage } from "electron";
import { AssignTypeService } from "app/assignType/service/assignType.service";

@Component({
  selector: "app-image-assignment",
  templateUrl: "./image-assignment.component.html",
  styleUrls: ["./image-assignment.component.css"],
})
export class ImageAssignmentComponent {
  rooms: RoomInterface[];
  assignTypes: AssignTypeInterface[];
  principalList: ParticipantInterface[];
  assistantList: ParticipantInterface[];
  footerNotes: NoteInterface[];
  assignments: AssignmentInterface[];

  copied = false;
  copiedCalendarReminder = false;

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

  assignment: AssignmentInterface = this.assignmentService.getAssignment(
    this.activatedRoute.snapshot.params.id
  );

  footerNoteEditorHTML: string = this.noteService.getNote(
    this.assignment.footerNote
  )?.editorHTML;

  constructor(
    private assignmentService: AssignmentService,
    private assignTypeService: AssignTypeService,
    private noteService: NoteService,
    private activatedRoute: ActivatedRoute,
    private configService: ConfigService,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Copy image to the clipboard
   */
  async copyImageToClipboard() {
    document.body.style.cursor = "wait";
    const node = document.getElementById("assignmentTableId");
    const dataUrl = await toPng(node);
    const natImage: NativeImage = nativeImage.createFromDataURL(dataUrl);
    clipboard.write(
      {
        image: natImage,
      },
      "selection"
    );
    document.body.style.cursor = "default";
    this.copied = true;
    this.cdr.detectChanges();
  }

  /**
   * Experimental, this feature can be disabled by google at any moment
   * date is a ISO date, to get the local day, month use normal "getDate" "getMonth"
   * getMonth is 0-11 index but google api is 1-12 so we add +1
   * The reminder appears the night before the assignment
   */
  toGoogleCalendarUrl() {
    const assignType = this.assignTypeService.getAssignType(
      this.assignment.assignType
    );
    const date = new Date(this.assignment.date);
    const dateNextDay = new Date(this.assignment.date);
    dateNextDay.setDate(dateNextDay.getDate() + 1); //Add +1 to be full day event
    let url = `https://www.google.com/calendar/render?action=TEMPLATE
    &text=${encodeURI(assignType.name)}
    &details=${encodeURI(this.assignment.theme)}
    &dates=${encodeURI(
      date
        .toISOString()
        .replace(/-/g, "")
        .replace(/:/g, "")
        .replace(/\./g, "") +
        "/" +
        dateNextDay
          .toISOString()
          .replace(/-/g, "")
          .replace(/:/g, "")
          .replace(/\./g, "")
    )}`;
    url = url.replace(/\s/g, "");
    clipboard.write(
      {
        text: url,
      },
      "selection"
    );
    this.copiedCalendarReminder = true;
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
    const doc = this.pdfService.getJsPdf({ orientation: "portrait" });

    const font = this.pdfService.getFontForLang();

    autoTable(doc, {
      html: `#assignmentTableId`,
      styles: { font, fontSize: 15 },
      columnStyles: { 0: { cellWidth: 110 } },
      didParseCell: (data) => {
        data.cell.text = data.cell.text.map((char) => char.trim());
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const classList: DOMTokenList = data.cell.raw["classList"];
        if (classList.contains("fw-bold")) {
          data.cell.styles.fontStyle = "bold";
        }
        data.cell.styles.fillColor = "#FFFFFF";
      },
    });

    doc.save("assignment");
  }
}
