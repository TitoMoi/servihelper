import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ConfigService } from "app/config/service/config.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { ExcelService } from "app/services/excel.service";
import { SortService } from "app/services/sort.service";
import { toPng } from "html-to-image";
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
  AssignmentReportInterface,
} from "../model/assignment.model";
import { AssignmentService } from "../service/assignment.service";
import { PdfService } from "app/services/pdf.service";

@Component({
  selector: "app-selection-list-hor",
  templateUrl: "./selection-list-hor.component.html",
  styleUrls: ["./selection-list-hor.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionListHorComponent implements OnChanges {
  @Input() selectedDates: Date[];
  @Input() assignTypes: string[];
  @Input() rooms: string[];
  @Input() order: string;

  colorpicker: string = undefined;
  tableWithColor = {};

  defaultReportFontSize =
    this.configService.getConfig().defaultReportFontSize + "px";
  defaultReportDateFormat =
    this.configService.getConfig().defaultReportDateFormat;
  defaultReportDateColor =
    this.configService.getConfig().defaultReportDateColor;
  reportTitle = this.configService.getConfig().reportTitle;

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
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectedDates.length && this.assignTypes) {
      this.#assignments = [];
      this.assignmentGroups = [];
      this.filterAssignments().then(() => {
        this.sortAssignmentByDate(this.order);
        this.#assignments = this.sortService.sortAssignmentsByRoomAndAssignType(
          this.#assignments
        );
        this.getRelatedData();
        this.cdr.detectChanges();
      });
    }
  }

  /**
   * Filters the assignments based on the range date and assign types
   */
  async filterAssignments() {
    this.#assignments = await this.assignmentService.getAssignments(true);
    this.#assignments = this.#assignments.filter(
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

  sortAssignmentByAssignTypeOrder() {
    for (const ag of this.assignmentGroups) {
      ag.assignments.sort(
        (
          a: AssignmentReportInterface,
          b: AssignmentReportInterface
        ): number => {
          const orderA = this.assignTypeService.getAssignType(
            a.assignType.id
          ).order;
          const orderB = this.assignTypeService.getAssignType(
            b.assignType.id
          ).order;

          if (orderA > orderB) {
            return 1;
          }
          if (orderA < orderB) {
            return -1;
          }
          return 0;
        }
      );
    }
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
        //save and reset
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

  /**
   * pass to jsPdf a very long height so he thinks the has 90000 millimeters to draw, after each table "didDrawPage"
   * will put the pointer Y more down, the last Y pointer is the height
   * If we dont pass 90000 to draw will output diferent Y positions, because A4 height is 270 so if the table doesnt fit
   * will output something like 237 and 98 this is last 2 pages pointers because in last 1 page doesnt fit.
   *
   * For the X axis is not consistent, so we count the cells that are assignments and multiply by something it fits a big title
   *
   * @returns the total height
   */
  getPdfFormat(): Record<"maxTotalCells" | "totalHeight", number> {
    const doc = this.pdfService.getJsPdf({
      orientation: "landscape",
      format: [297, 90000],
    });

    const font = this.pdfService.getFontForLang();

    let totalHeight = 0;
    let maxTotalCells = 0;

    let firstTable = true;

    for (let i = 0; i < this.assignmentGroups.length; i++) {
      let totalCells = 1; //Begins in 1 because date is not an assignment so we count it in advance

      autoTable(doc, {
        html: `#table${i}`,
        styles: { font, fontSize: 16 },
        margin: firstTable ? { top: 30 } : undefined,
        didParseCell: (data) => {
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const id = data.cell.raw["id"];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const localName = data.cell.raw["localName"];

          const assignType = this.assignTypeService.getAssignType(id);
          if (assignType) {
            totalCells++;

            data.cell.styles.fillColor = assignType.color;
            data.cell.styles.fontStyle = "bold";
            return;
          }
          if (localName === "th" && !assignType) {
            //the "or" condition is necessary, otherwise pdf is not showed in acrobat reader
            data.cell.styles.fillColor =
              this.configService.getConfig().defaultReportDateColor ||
              "#FFFFFF";
            data.cell.styles.fontStyle = "bold";
          }
        },
        didDrawPage: (data) => {
          totalHeight = data.cursor.y;
        },
      });
      maxTotalCells = totalCells > maxTotalCells ? totalCells : maxTotalCells;
      firstTable = false;
    }
    return { maxTotalCells, totalHeight };
  }

  toPdf() {
    const pdfFormat = this.getPdfFormat();

    const doc = this.pdfService.getJsPdf({
      orientation: "landscape",
      unit: "mm",
      format: [pdfFormat.maxTotalCells * 35 + 35, pdfFormat.totalHeight + 100], //Extra cell 35 for the margins
      compress: true,
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
        styles: { font, fontSize: 16, cellWidth: 35 },
        margin: firstTable ? { top: 30 } : undefined,
        didParseCell: (data) => {
          data.cell.styles.fillColor = this.tableWithColor[tableId];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const id = data.cell.raw["id"];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const localName = data.cell.raw["localName"];

          const assignType = this.assignTypeService.getAssignType(id);
          if (assignType) {
            data.cell.styles.fillColor =
              this.tableWithColor[tableId] || assignType.color;
            data.cell.styles.fontStyle = "bold";
            return;
          }
          if (localName === "th" && !assignType) {
            //the "or" condition is necessary, otherwise pdf is not showed in acrobat reader
            data.cell.styles.fillColor =
              this.tableWithColor[tableId] ||
              this.configService.getConfig().defaultReportDateColor ||
              "#FFFFFF";
            data.cell.styles.fontStyle = "bold";
          }
        },
      });
      firstTable = false;
    }
    doc.save("assignments");
  }

  toPdfForPrint() {
    const doc = this.pdfService.getJsPdf({ orientation: "landscape" });

    const font = this.pdfService.getFontForLang();

    doc.text(this.reportTitle, doc.internal.pageSize.width / 2, 20, {
      align: "center",
    });

    let firstTable = true;

    for (let i = 0; i < this.assignmentGroups.length; i++) {
      const tableId = `table${i}`;
      autoTable(doc, {
        html: "#" + tableId,
        styles: { font, fontSize: 14 },
        margin: firstTable ? { top: 30 } : undefined,
        didParseCell: (data) => {
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const id = data.cell.raw["id"];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const localName = data.cell.raw["localName"];

          const assignType = this.assignTypeService.getAssignType(id);
          if (assignType) {
            data.cell.styles.fillColor =
              this.tableWithColor[tableId] || assignType.color;
            data.cell.styles.fontStyle = "bold";
            return;
          }
          if (localName === "th" && !assignType) {
            //the "or" condition is necessary, otherwise pdf is not showed in acrobat reader
            data.cell.styles.fillColor =
              this.tableWithColor[tableId] ||
              this.configService.getConfig().defaultReportDateColor ||
              "#FFFFFF";
            data.cell.styles.fontStyle = "bold";
          }
        },
      });
      firstTable = false;
    }
    doc.save("assignmentsPrint");
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
    this.excelService.addAsignmentsHorizontal(
      this.assignmentGroups,
      this.tableWithColor
    );
  }
  /**
   *
   * @param event the pointerEvent
   * Override assignment styles and date styles and apply same background for all the day
   */
  changeBackgroundColor(event) {
    const targetId = event.currentTarget.id;
    const tableElem: HTMLTableElement = document.getElementById(
      targetId
    ) as HTMLTableElement;

    const selectedColor = this.colorpicker;

    //Override assignment and date colors and reset
    const trList: HTMLCollection = tableElem.children; //tr
    const length = trList.length;
    for (let i = 0; i < length; i++) {
      const childNodes: NodeList = trList[i].childNodes; //th, td

      childNodes.forEach((child: HTMLTableElement) => {
        if (child.style) {
          child.style.backgroundColor = ""; //must be empty string
        }
      });
    }
    //Apply background for all the table
    tableElem.style.backgroundColor = selectedColor;

    //Save color for the selected table
    this.tableWithColor[targetId] = selectedColor;
  }
}
