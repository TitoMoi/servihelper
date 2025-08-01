/* eslint-disable @typescript-eslint/naming-convention */
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeInterface } from "app/assigntype/model/assigntype.model";
import { ConfigService } from "app/config/service/config.service";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { ParticipantInterface } from "app/participant/model/participant.model";
import { RoomInterface } from "app/room/model/room.model";
import autoTable from "jspdf-autotable";

import { ChangeDetectorRef, Component } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { PdfService } from "app/services/pdf.service";
import { clipboard } from "electron";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ParticipantPipe } from "../../participant/pipe/participant.pipe";
import { RoomPipe } from "../../room/pipe/room.pipe";
import { AssignTypePipe } from "../../assigntype/pipe/assign-type.pipe";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { NgClass } from "@angular/common";
import { TranslocoModule } from "@ngneat/transloco";
import { SheetTitlePipe } from "app/sheet-title/pipe/sheet-title.pipe";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ExportService } from "app/services/export.service";
import { PublicThemePipe } from "app/public-theme/pipe/public-theme.pipe";
import { AssignTypeNamePipe } from "app/assigntype/pipe/assign-type-name.pipe";
import { MatChipsModule } from "@angular/material/chips";
import { SharedService } from "app/services/shared.service";
import { RoomNamePipe } from "app/room/pipe/room-name.pipe";

@Component({
    selector: "app-image-assignment",
    templateUrl: "./image-assignment.component.html",
    styleUrls: ["./image-assignment.component.css"],
    imports: [
        TranslocoModule,
        NgClass,
        MatButtonModule,
        RouterLink,
        MatIconModule,
        TranslocoLocaleModule,
        AssignTypePipe,
        AssignTypeNamePipe,
        RoomPipe,
        ParticipantPipe,
        SheetTitlePipe,
        MatTooltipModule,
        PublicThemePipe,
        MatChipsModule,
        RoomNamePipe,
    ]
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
  assignmentHeaderTitle = this.configService.getConfig().assignmentHeaderTitle; //default config sheet title
  assignmentPrincipalTitle = this.configService.getConfig().assignmentPrincipalTitle;
  assignmentAssistantTitle = this.configService.getConfig().assignmentAssistantTitle;
  assignmentDateTitle = this.configService.getConfig().assignmentDateTitle;
  assignmentAssignTypeTitle = this.configService.getConfig().assignmentAssignTypeTitle;
  assignmentThemeTitle = this.configService.getConfig().assignmentThemeTitle;
  assignmentRoomTitle = this.configService.getConfig().assignmentRoomTitle;
  assignmentNoteTitle = this.configService.getConfig().assignmentNoteTitle;

  assignment: AssignmentInterface = this.assignmentService.getAssignment(
    this.activatedRoute.snapshot.params.id,
  );

  footerNoteEditorHTML: string = this.noteService.getNote(this.assignment.footerNote)
    ?.editorHTML;

  constructor(
    private assignmentService: AssignmentService,
    private assignTypeService: AssignTypeService,
    private noteService: NoteService,
    private activatedRoute: ActivatedRoute,
    private configService: ConfigService,
    private pdfService: PdfService,
    private exportService: ExportService,
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Copy image to the clipboard
   */
  async toClipboard() {
    this.exportService.toClipboard("assignmentTableId");
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
    const assignType = this.assignTypeService.getAssignType(this.assignment.assignType);
    const date = new Date(this.assignment.date);
    const dateNextDay = new Date(this.assignment.date);
    dateNextDay.setDate(dateNextDay.getDate() + 1); //Add +1 to be full day event
    let url = `https://www.google.com/calendar/render?action=TEMPLATE
    &text=${encodeURI(this.assignTypeService.getNameOrTranslation(assignType))}
    &details=${encodeURI(this.assignment.theme)}
    &dates=${encodeURI(
      date.toISOString().replace(/-/g, "").replace(/:/g, "").replace(/\./g, "") +
        "/" +
        dateNextDay.toISOString().replace(/-/g, "").replace(/:/g, "").replace(/\./g, ""),
    )}`;
    url = url.replace(/\s/g, "");
    clipboard.write(
      {
        text: url,
      },
      "selection",
    );
    this.copiedCalendarReminder = true;
  }

  async toPng() {
    const filename = this.sharedService.getFilename(this.assignment);
    this.exportService.toPng("assignmentTableId", filename);
  }

  toPdf() {
    const doc = this.pdfService.getJsPdf({
      orientation: "portrait",
      format: "a6",
      compress: true,
    });

    const font = this.pdfService.getFontForLang();

    autoTable(doc, {
      html: `#assignmentTableId`,
      styles: { font, fontSize: 10 },
      margin: { vertical: 2, horizontal: 2 },
      didParseCell: (data) => {
        data.cell.text = data.cell.text.map((char) => char.trim());
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const classList: DOMTokenList = data.cell.raw["classList"];
        if (classList.contains("fw-bold")) {
          data.cell.styles.fontStyle = "bold";

          if (classList.contains("sheetTitle")) {
            data.cell.styles.halign = "center";
          }
        }
        data.cell.styles.fillColor = "#FFFFFF";
      },
    });
    const filename = this.sharedService.getFilename(this.assignment);
    doc.save(filename);
  }

  async toPdfS89() {
    const pdfBytes = await this.pdfService.toPdfS89([this.assignment], false);
    this.sharedService.saveBlobAsPdfFile(
      pdfBytes,
      this.sharedService.getFilename(this.assignment),
    );
  }
}
