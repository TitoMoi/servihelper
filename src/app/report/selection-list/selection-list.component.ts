import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ConfigService } from "app/config/service/config.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { ExcelService } from "app/services/excel.service";
import { SortOrderType, SortService } from "app/services/sort.service";
import { PdfService } from "app/services/pdf.service";
import autoTable from "jspdf-autotable";

/* eslint-disable @typescript-eslint/naming-convention */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";

import {
  AssignmentGroupInterface,
  AssignmentInterface,
} from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypePipe } from "../../assigntype/pipe/assign-type.pipe";
import { TranslocoLocaleModule, TranslocoLocaleService } from "@ngneat/transloco-locale";
import { NgIf, NgFor } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";
import { ExportService } from "app/services/export.service";
import { PublicThemeService } from "app/public-theme/service/public-theme.service";
import { AssignTypeNamePipe } from "app/assigntype/pipe/assign-type-name.pipe";
import { RoomNamePipe } from "app/room/pipe/room-name.pipe";
import { readFileSync } from "fs-extra";
import path from "path";

@Component({
  selector: "app-selection-list",
  templateUrl: "./selection-list.component.html",
  styleUrls: ["./selection-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoModule,
    MatIconModule,
    MatTooltipModule,
    NgIf,
    NgFor,
    TranslocoLocaleModule,
    AssignTypePipe,
    AssignTypeNamePipe,
  ],
})
export class SelectionListComponent implements OnChanges {
  @Input() selectedDates: Date[];
  @Input() assignTypes: string[];
  @Input() rooms: string[];
  @Input() order: SortOrderType;

  defaultReportFontSize = this.configService.getConfig().defaultReportFontSize + "px";
  defaultReportDateFormat = this.configService.getConfig().defaultReportDateFormat;
  defaultReportDateColor = this.configService.getConfig().defaultReportDateColor;

  reportTitle = this.configService.getConfig().reportTitle;

  assignmentGroups: AssignmentGroupInterface[] = [];

  #assignments: AssignmentInterface[] = [];

  constructor(
    public assignTypeService: AssignTypeService,
    public configService: ConfigService,
    private roomService: RoomService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private publicThemeService: PublicThemeService,
    private sortService: SortService,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private exportService: ExportService,
    private roomNamePipe: RoomNamePipe,
    private translocoLocaleService: TranslocoLocaleService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnChanges(changes: SimpleChanges) {
    if (this.selectedDates.length && this.assignTypes) {
      this.#assignments = [];
      this.assignmentGroups = [];
      this.filterAssignments().then(() => {
        this.#assignments = this.sortService.sortAssignmentsByDateThenRoomAndAssignType(
          this.#assignments,
          this.order
        );
        this.getRelatedData();
        this.cdr.detectChanges();
      });
    }
  }

  /**
   * Filters the assignments based on the range date and assign types and rooms
   */
  async filterAssignments() {
    this.#assignments = await this.assignmentService.getAssignments(true);

    this.#assignments = this.#assignments.filter(
      (assignment) =>
        this.assignTypes.includes(assignment.assignType) &&
        this.rooms.includes(assignment.room) &&
        this.selectedDates.some(
          (date) => new Date(date).getTime() === new Date(assignment.date).getTime()
        )
    );
  }

  getBorderRight(color): string {
    return `border-right: 12px solid ${color};`;
  }
  /**
   * Convert the id's to names
   */
  getRelatedData() {
    let assignGroup: AssignmentGroupInterface = {
      date: undefined,
      roomName: undefined,
      assignments: [],
    };

    let length = this.#assignments.length;

    for (const assignment of this.#assignments) {
      --length;

      if (!assignGroup.date) assignGroup.date = assignment.date;

      if (
        new Date(assignGroup.date).toISOString() !== new Date(assignment.date).toISOString()
      ) {
        //save and prepare another assignGroup
        this.assignmentGroups.push(assignGroup);
        assignGroup = {
          date: assignment.date,
          roomName: undefined,
          assignments: [],
        };
      }

      if (!assignGroup.roomName)
        assignGroup.roomName = this.roomNamePipe.transform(
          this.roomService.getRoom(assignment.room)
        );

      if (
        assignGroup.roomName !==
        this.roomNamePipe.transform(this.roomService.getRoom(assignment.room))
      ) {
        //save and prepare another assignGroup
        this.assignmentGroups.push(assignGroup);
        assignGroup = {
          date: assignment.date,
          roomName: this.roomNamePipe.transform(this.roomService.getRoom(assignment.room)),
          assignments: [],
        };
      }

      assignGroup.assignments.push({
        id: assignment.id,
        date: assignment.date,
        sheetTitle: assignment.sheetTitle,
        room: this.roomService.getRoom(assignment.room),
        assignType: this.assignTypeService.getAssignType(assignment.assignType),
        theme: assignment.isPTheme
          ? this.publicThemeService.getPublicTheme(assignment.theme)?.name
          : assignment.theme,
        isPTheme: assignment.isPTheme,
        onlyWoman: false,
        onlyMan: false,
        principal: this.participantService.getParticipant(assignment.principal),
        assistant: this.participantService.getParticipant(assignment.assistant),
        footerNote: "",
      });

      if (!length) this.assignmentGroups.push(assignGroup);
    }
  }

  /**
   * pass to jsPdf a very long height so he thinks the has 90000 millimeters to draw, after each table "didDrawPage"
   * will put the pointer Y more down, the last Y pointer is the height
   * If we dont pass 90000 to draw will output diferent Y positions, because A4 height is 270 so if the table doesnt fit
   * will output something like 237 and 98 this is last 2 pages pointers because in last 1 page doesnt fit.
   *
   * @returns the total height
   */
  getPdfHeight(): number {
    const doc = this.pdfService.getJsPdf({
      orientation: "portrait",
      format: [210, 90000],
    });

    const font = this.pdfService.getFontForLang();

    let totalHeight = 0;

    for (let i = 0; i < this.assignmentGroups.length; i++) {
      autoTable(doc, {
        html: `#table${i}`,
        styles: { font, fontSize: 11 },
        theme: "plain",
        margin: { vertical: 10, horizontal: 4 },
        columnStyles: { 0: { cellWidth: 140 }, 1: { cellWidth: 50 } },
        didParseCell: (data) => {
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const id = data.cell.raw["id"];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const localName = data.cell.raw["localName"];
          const assignType = this.assignTypeService.getAssignType(id);
          if (assignType) {
            data.cell.styles.fontStyle = "bold";
            return;
          }
          //date
          if (localName === "th") {
            data.cell.styles.fontStyle = "bold";
            return;
          }
        },
        didDrawPage: (data) => {
          totalHeight = data.cursor.y;
        },
      });
    }
    return totalHeight;
  }

  /**
   *
   * @param isForPrint if true, adds breakpoints in the pages, false generates an infinite list
   *
   */
  toPdf(isForPrint: boolean) {
    const height = this.getPdfHeight();
    const doc = this.pdfService.getJsPdf({
      orientation: "portrait",
      compress: true,
      format: isForPrint ? "a4" : [210, height + 50], //infinite list
    });

    const font = this.pdfService.getFontForLang();

    doc.text(this.reportTitle, doc.internal.pageSize.width / 2, 8, {
      align: "center",
    });

    for (let i = 0; i < this.assignmentGroups.length; i++) {
      const tableId = `table${i}`;
      autoTable(doc, {
        html: "#" + tableId,
        styles: { font, fontSize: 11 },
        theme: "plain",
        margin: { vertical: 10, horizontal: 8 },
        columnStyles: { 0: { cellWidth: 152 }, 1: { cellWidth: 42 } },
        didParseCell: (data) => {
          //bug fix
          data.cell.text = data.cell.text.map((char) => char.trim());
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const localName = data.cell.raw["localName"];
          //date
          if (localName === "th") {
            data.cell.styles.fontStyle = "bold";
            return;
          }
        },
      });
    }

    doc.save(isForPrint ? "assignmentsPrint" : "assignments");
  }

  async toPng() {
    this.exportService.toPng("toPngDivId", "assignments");
  }

  toPdfOpinionatedWeekend() {}

  toPdfOpinionated() {
    const doc = this.pdfService.getJsPdf({
      orientation: "portrait",
      format: "a4",
    });

    const fontSize = 11;
    doc.setFont(this.pdfService.font);
    doc.setFontSize(fontSize);
    /* const dpi = 300; */
    let x = 10;
    let y = 10;

    let treasuresFromWordBand = false;
    let improvePreachingBand = false;
    let livingAsChristiansBand = false;
    //margins are 10, so... w = 210 - 10 - 10  = 190, h = 270 - 10 - 10 = 250
    //titles are 10, so we have 3 titles * 2 weeks = 250 - (30 * 2) = 190
    //week is 190, we have two weeks so... 190 / 2 = 95 for assignments for each week
    //In the header for each week goes the date so... 95 - 5 = 90
    //And a separator between week 1 and 2 of 10 so... 90 - 5 = 85

    /* const totalHeightPerWeek = 85; */
    /* const totalHeightForAssignments = totalHeightPerWeek - 8 * 3; */

    const pageWidth = 190;
    const maxLineWidth = pageWidth - 50;
    const maxLineWidthParticipants = pageWidth - 160;

    /* const lineHeight = (fontSize * 1.15) / dpi; */

    //Every two weeks add a page
    let weekCounter = 2;

    for (const ag of this.assignmentGroups) {
      if (!weekCounter) {
        doc.addPage("a4", "p");
        y = 10;
      }
      //Get the height for the assignments
      let totalTextLines = 0;
      //Reset the bands
      treasuresFromWordBand = false;
      improvePreachingBand = false;
      livingAsChristiansBand = false;
      for (const a of ag.assignments) {
        const themeOrAssignType = a.theme ? a.theme : a.assignType.name;
        const textLinesTheme = doc.splitTextToSize(themeOrAssignType, maxLineWidth);

        totalTextLines = totalTextLines + textLinesTheme.length;
      }
      const dateText = this.translocoLocaleService.localizeDate(
        ag.date,
        this.translocoLocaleService.getLocale(),
        { dateStyle: this.defaultReportDateFormat }
      );
      //date
      doc.setFont(this.pdfService.font, "bold");
      doc.setFontSize(13);
      //room
      doc.text(dateText, x, y, {});
      doc.text(ag.roomName, x + 145, y);
      y = y + 7;
      doc.setFont(this.pdfService.font, "normal");
      doc.setFontSize(11);

      for (const a of ag.assignments) {
        const themeOrAssignType = a.theme ? a.theme : a.assignType.name;
        const textLinesTheme = doc.splitTextToSize(themeOrAssignType, maxLineWidth);

        const participantsNames =
          a.principal.name + (a.assistant ? " / " + a.assistant.name : "");
        const textLinesParticipants = doc.splitTextToSize(
          participantsNames,
          maxLineWidthParticipants
        );

        const heightTheme = 3.5 * (textLinesTheme.length + 1);
        /* (totalHeightForAssignments / totalTextLines) * (textLinesTheme.length + 1); */
        const heightParticipantNames = 3 * (textLinesParticipants.length + 1);
        /* (totalHeightForAssignments / totalTextLines) * (textLinesParticipants.length + 1); */
        const height =
          heightTheme > heightParticipantNames ? heightTheme : heightParticipantNames;
        //Bands
        if (
          this.assignTypeService.treasuresAssignmentTypes.includes(a.assignType.type) &&
          !treasuresFromWordBand
        ) {
          y = y - 3;
          const image = path.join(this.configService.iconsFilesPath, "diamond.jpg");
          const uint8array = new Uint8Array(readFileSync(image));
          doc.addImage(uint8array, "JPEG", x, y, 5, 5);
          //the band paints from baseline to bottom, text is from baseline to above
          doc.setFillColor(a.assignType.color);
          doc.rect(20, y, 180, 5, "F");
          treasuresFromWordBand = true;
          y = y + 10; //The band has taken 6 (2 + 4) plus 2 to ending space
        }
        if (
          this.assignTypeService.improvePreachingAssignmentTypes.includes(a.assignType.type) &&
          !improvePreachingBand
        ) {
          y = y - 3;

          const image = path.join(this.configService.iconsFilesPath, "wheat.jpg");
          const uint8array = new Uint8Array(readFileSync(image));
          doc.addImage(uint8array, "JPEG", x, y, 5, 5);

          doc.setFillColor(a.assignType.color);
          doc.rect(20, y, 180, 5, "F");
          improvePreachingBand = true;
          y = y + 10;
        }
        if (
          this.assignTypeService.liveAsChristiansAssignmentTypes.includes(a.assignType.type) &&
          !livingAsChristiansBand
        ) {
          y = y - 3;

          const image = path.join(this.configService.iconsFilesPath, "sheep.jpg");
          const uint8array = new Uint8Array(readFileSync(image));
          doc.addImage(uint8array, "JPEG", x, y, 5, 5);

          doc.setFillColor(a.assignType.color);
          doc.rect(20, y, 180, 5, "F");
          livingAsChristiansBand = true;
          y = y + 10;
        }
        doc.text(textLinesTheme, x, y);
        doc.text(textLinesParticipants, x + 145, y);
        y = y + height;
      }
      //Separator betweek week 1 and 2
      y = y + 8;
      weekCounter--;
    }
    doc.save("assignmentsBands");
  }

  toExcel() {
    this.excelService.addAsignmentsVertical(this.assignmentGroups);
  }
}
