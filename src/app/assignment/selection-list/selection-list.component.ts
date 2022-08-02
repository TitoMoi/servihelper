import { AssignTypeService } from 'app/assignType/service/assignType.service';
import { ConfigService } from 'app/config/service/config.service';
import { ParticipantService } from 'app/participant/service/participant.service';
import { RoomService } from 'app/room/service/room.service';
import { ExcelService } from 'app/services/excel.service';
import { SortService } from 'app/services/sort.service';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* eslint-disable @typescript-eslint/naming-convention */
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { AssignmentGroupInterface, AssignmentInterface } from '../model/assignment.model';
import { AssignmentService } from '../service/assignment.service';

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
    private excelService: ExcelService
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
      room: undefined,
      assignments: [],
    };

    let length = this.#assignments.length;

    for (const assignment of this.#assignments) {
      --length;

      if (!assignGroup.date) assignGroup.date = assignment.date;

      if (assignGroup.date !== assignment.date) {
        //save and prepare another assignGroup
        this.assignmentGroups.push(assignGroup);
        assignGroup = {
          date: assignment.date,
          room: undefined,
          assignments: [],
        };
      }

      if (!assignGroup.room)
        assignGroup.room = this.roomService.getRoom(assignment.room).name;

      if (assignGroup.room !== this.roomService.getRoom(assignment.room).name) {
        //save and prepare another assignGroup
        this.assignmentGroups.push(assignGroup);
        assignGroup = {
          date: assignment.date,
          room: this.roomService.getRoom(assignment.room).name,
          assignments: [],
        };
      }

      assignGroup.assignments.push({
        id: assignment.id,
        date: assignment.date,
        room: this.roomService.getRoom(assignment.room).name,
        assignType: this.assignTypeService.getAssignType(assignment.assignType)
          .name,
        theme: assignment.theme,
        onlyWoman: false,
        onlyMan: false,
        principal: this.participantService.getParticipant(assignment.principal)
          .name,
        assistant: this.participantService.getParticipant(assignment.assistant)
          ?.name,
        footerNote: "",
      });

      if (!length) this.assignmentGroups.push(assignGroup);
    }
  }

  toPdf() {
    const doc = new jsPDF("portrait");

    for (let i = 0; i < this.assignmentGroups.length; i++) {
      autoTable(doc, {
        html: `#table${i}`,
        columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 80 } },
        didParseCell: (data) => {
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const text = data.cell.raw["innerText"];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const localName = data.cell.raw["localName"];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const classList: DOMTokenList = data.cell.raw["classList"];
          const assignType = this.assignTypeService.getAssignTypeByName(text);
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
    doc.save("assignments.pdf");
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
