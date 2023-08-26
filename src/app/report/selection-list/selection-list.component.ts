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
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { NgIf, NgFor } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";
import { ExportService } from "app/services/export.service";
import { PublicThemeService } from "app/public-theme/service/public-theme.service";

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
    return `border-right: 8px solid ${color};`;
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
        assignGroup.roomName = this.roomService.getRoom(assignment.room).name;

      if (assignGroup.roomName !== this.roomService.getRoom(assignment.room).name) {
        //save and prepare another assignGroup
        this.assignmentGroups.push(assignGroup);
        assignGroup = {
          date: assignment.date,
          roomName: this.roomService.getRoom(assignment.room).name,
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

    let firstTable = true;

    for (let i = 0; i < this.assignmentGroups.length; i++) {
      autoTable(doc, {
        html: `#table${i}`,
        styles: { font, fontSize: 13, halign: "left" },
        theme: "plain",
        margin: firstTable ? { top: 30 } : undefined,
        columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 80 } },
        didParseCell: (data) => {
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const id = data.cell.raw["id"];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const localName = data.cell.raw["localName"];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const classList: DOMTokenList = data.cell.raw["classList"];
          const assignType = this.assignTypeService.getAssignType(id);
          if (assignType) {
            data.cell.styles.fontStyle = "bold";
            return;
          }
          //date
          if (localName === "th") {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fontSize = 14;
            return;
          }
          //theme
          if (!assignType && localName === "td" && classList.contains("bold")) {
            data.cell.styles.fontStyle = "bold";
            return;
          }
        },
        didDrawPage: (data) => {
          totalHeight = data.cursor.y;
        },
      });
      firstTable = false;
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
      format: isForPrint ? undefined : [210, height + 50],
    });

    const font = this.pdfService.getFontForLang();

    doc.text(this.reportTitle, doc.internal.pageSize.width / 2, 20, {
      align: "center",
    });

    let firstTable = true;

    for (let i = 0; i < this.assignmentGroups.length; i++) {
      const tableId = `table${i}`;
      autoTable(doc, {
        html: "#" + tableId,
        styles: { font, fontSize: 13 },
        theme: "plain",
        margin: this.reportTitle ? { top: 30 } : firstTable ? { top: 10 } : undefined,
        columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 80 } },
        didParseCell: (data) => {
          //bug fix
          data.cell.text = data.cell.text.map((char) => char.trim());
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const localName = data.cell.raw["localName"];
          //date
          if (localName === "th") {
            //the "or" condition is necessary, otherwise pdf is not showed in acrobat reader
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fontSize = 14;
            return;
          }
        },
      });
      firstTable = false;
    }

    doc.save(isForPrint ? "assignmentsPrint" : "assignments");
  }

  async toPng() {
    this.exportService.toPng("toPngDivId", "assignments");
  }

  toExcel() {
    this.excelService.addAsignmentsVertical(this.assignmentGroups);
  }
}
