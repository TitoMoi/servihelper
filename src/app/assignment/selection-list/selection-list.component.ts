import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ConfigService } from "app/config/service/config.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { ExcelService } from "app/services/excel.service";
import { SortService } from "app/services/sort.service";
import { PdfService } from "app/services/pdf.service";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* eslint-disable @typescript-eslint/naming-convention */
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";

import {
  AssignmentGroupInterface,
  AssignmentInterface,
} from "../model/assignment.model";
import { AssignmentService } from "../service/assignment.service";

@Component({
  selector: "app-selection-list",
  templateUrl: "./selection-list.component.html",
  styleUrls: ["./selection-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionListComponent implements OnChanges {
  @Input() selectedDates: Date[];
  @Input() assignTypes: string[];
  @Input() rooms: string[];
  @Input() order: string;

  defaultReportFontSize =
    this.configService.getConfig().defaultReportFontSize + "px";
  defaultReportDateFormat =
    this.configService.getConfig().defaultReportDateFormat;
  defaultReportDateColor =
    this.configService.getConfig().defaultReportDateColor;

  #assignments: AssignmentInterface[] = [];

  assignmentGroups: AssignmentGroupInterface[] = [];

  constructor(
    public assignTypeService: AssignTypeService,
    public configService: ConfigService,
    private roomService: RoomService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private sortService: SortService,
    private excelService: ExcelService,
    private pdfService: PdfService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectedDates.length && this.assignTypes) {
      this.#assignments = [];
      this.assignmentGroups = [];
      this.filterAssignments();
      this.sortAssignmentByDate(this.order);
      this.#assignments = this.sortService.sortAssignmentsByRoomAndAssignType(
        this.#assignments
      );
      this.getRelatedData();
    }
  }

  /**
   * Filters the assignments based on the range date and assign types and rooms
   */
  filterAssignments() {
    this.#assignments = this.assignmentService
      .getAssignments(true)
      .filter(
        (assignment) =>
          this.assignTypes.includes(assignment.assignType) &&
          this.rooms.includes(assignment.room) &&
          this.selectedDates.some(
            (date) =>
              new Date(date).getTime() === new Date(assignment.date).getTime()
          )
      );
  }

  sortAssignmentByDate(order: string) {
    if (order === "Desc") {
      this.#assignments = this.#assignments.sort(
        this.assignmentService.sortAssignmentsByDateDesc
      );
      return;
    }
    this.#assignments = this.#assignments.sort(
      this.assignmentService.sortAssignmentsByDateAsc
    );
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
        new Date(assignGroup.date).toISOString() !==
        new Date(assignment.date).toISOString()
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

      if (
        assignGroup.roomName !== this.roomService.getRoom(assignment.room).name
      ) {
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
        room: this.roomService.getRoom(assignment.room),
        assignType: this.assignTypeService.getAssignType(assignment.assignType),
        theme: assignment.theme,
        onlyWoman: false,
        onlyMan: false,
        principal: this.participantService.getParticipant(assignment.principal),
        assistant: this.participantService.getParticipant(assignment.assistant),
        footerNote: "",
      });

      if (!length) this.assignmentGroups.push(assignGroup);
    }
  }

  toPdfForPrint() {
    const doc = this.pdfService.getJsPdf({
      orientation: "portrait",
    });

    const font = this.pdfService.getFontForLang();

    for (let i = 0; i < this.assignmentGroups.length; i++) {
      autoTable(doc, {
        html: `#table${i}`,
        styles: { font },
        columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 80 } },
        didParseCell: (data) => {
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const id = data.cell.raw["id"];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const localName = data.cell.raw["localName"];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const classList: DOMTokenList = data.cell.raw["classList"];
          const assignType = this.assignTypeService.getAssignType(id);
          if (assignType) {
            data.cell.styles.fillColor = assignType.color;
            data.cell.styles.fontStyle = "bold";
            return;
          }
          //date
          if (localName === "th") {
            //the "or" condition is necessary, otherwise pdf is not showed in acrobat reader
            data.cell.styles.fillColor =
              this.configService.getConfig().defaultReportDateColor ||
              "#FFFFFF";
            data.cell.styles.fontStyle = "bold";
            return;
          }
          //theme
          if (!assignType && localName === "td" && classList.contains("bold")) {
            data.cell.styles.fillColor = "#FFFFFF";
            data.cell.styles.fontStyle = "bold";
            return;
          }
          if (!assignType && !classList.contains("bold"))
            data.cell.styles.fillColor = "#FFFFFF";
        },
      });
    }
    doc.save("assignmentsPrint");
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
        styles: { font },
        columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 80 } },
        didParseCell: (data) => {
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const id = data.cell.raw["id"];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const localName = data.cell.raw["localName"];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const classList: DOMTokenList = data.cell.raw["classList"];
          const assignType = this.assignTypeService.getAssignType(id);
          if (assignType) {
            data.cell.styles.fillColor = assignType.color;
            data.cell.styles.fontStyle = "bold";
            return;
          }
          //date
          if (localName === "th") {
            //the "or" condition is necessary, otherwise pdf is not showed in acrobat reader
            data.cell.styles.fillColor =
              this.configService.getConfig().defaultReportDateColor ||
              "#FFFFFF";
            data.cell.styles.fontStyle = "bold";
            return;
          }
          //theme
          if (!assignType && localName === "td" && classList.contains("bold")) {
            data.cell.styles.fillColor = "#FFFFFF";
            data.cell.styles.fontStyle = "bold";
            return;
          }
          if (!assignType && !classList.contains("bold"))
            data.cell.styles.fillColor = "#FFFFFF";
        },
        didDrawPage: (data) => {
          totalHeight = data.cursor.y;
        },
      });
    }
    return totalHeight;
  }

  /**
   * To digital pdf, give 50 extra space at the end
   */
  toPdf() {
    const height = this.getPdfHeight();
    const doc = this.pdfService.getJsPdf({
      orientation: "portrait",
      format: [210, height + 50],
    });

    const font = this.pdfService.getFontForLang();

    for (let i = 0; i < this.assignmentGroups.length; i++) {
      autoTable(doc, {
        html: `#table${i}`,
        styles: { font },
        columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 80 } },
        didParseCell: (data) => {
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const id = data.cell.raw["id"];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const localName = data.cell.raw["localName"];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const classList: DOMTokenList = data.cell.raw["classList"];
          const assignType = this.assignTypeService.getAssignType(id);
          if (assignType) {
            data.cell.styles.fillColor = assignType.color;
            data.cell.styles.fontStyle = "bold";
            return;
          }
          //date
          if (localName === "th") {
            //the "or" condition is necessary, otherwise pdf is not showed in acrobat reader
            data.cell.styles.fillColor =
              this.configService.getConfig().defaultReportDateColor ||
              "#FFFFFF";
            data.cell.styles.fontStyle = "bold";
            return;
          }
          //theme
          if (!assignType && localName === "td" && classList.contains("bold")) {
            data.cell.styles.fillColor = "#FFFFFF";
            data.cell.styles.fontStyle = "bold";
            return;
          }
          if (!assignType && !classList.contains("bold"))
            data.cell.styles.fillColor = "#FFFFFF";
        },
      });
    }
    doc.save("assignments");
  }

  async toPng() {
    //the div
    document.body.style.cursor = "wait";
    const div = document.getElementById("toPngDivId");
    const dataUrl = await toPng(div);

    const link = document.createElement("a");
    link.href = dataUrl;
    link.setAttribute("download", "assignments.png");
    link.click();

    document.body.style.cursor = "default";
  }

  toExcel() {
    this.excelService.addAsignmentsVertical(this.assignmentGroups);
  }
}
