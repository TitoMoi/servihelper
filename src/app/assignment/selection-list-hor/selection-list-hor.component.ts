import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { toPng } from "html-to-image";
import {
  AssignmentGroupInterface,
  AssignmentInterface,
} from "../model/assignment.model";
import { AssignmentService } from "../service/assignment.service";
import { ExcelService } from "app/services/excel.service";
import { ConfigService } from "app/config/service/config.service";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

@Component({
  selector: "app-selection-list-hor",
  templateUrl: "./selection-list-hor.component.html",
  styleUrls: ["./selection-list-hor.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionListHorComponent implements OnChanges {
  @Input() selectedDates: Date[];
  @Input() assignTypes: string[];
  @Input() order: string;

  #assignments: AssignmentInterface[] = [];

  assignmentGroups: AssignmentGroupInterface[] = [];

  constructor(
    public assignTypeService: AssignTypeService,
    public configService: ConfigService,
    private roomService: RoomService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private excelService: ExcelService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectedDates.length && this.assignTypes) {
      this.#assignments = [];
      this.assignmentGroups = [];
      this.filterAssignments();
      this.sortAssignmentByDate(this.order);
      this.getRelatedData();
      this.sortAssignmentByAssignTypeOrder();
    }
  }

  /**
   * Filters the assignments based on the range date and assign types
   */
  filterAssignments() {
    this.#assignments = this.assignmentService
      .getAssignments(true)
      .filter((assignment) => this.assignTypes.includes(assignment.assignType))
      .filter((assignment) =>
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
        (a: AssignmentInterface, b: AssignmentInterface): number => {
          const orderA = this.assignTypeService.getAssignTypeByName(
            a.assignType
          ).order;
          const orderB = this.assignTypeService.getAssignTypeByName(
            b.assignType
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
      assignments: [],
    };

    let length = this.#assignments.length;

    for (const assignment of this.#assignments) {
      --length;

      if (!assignGroup.date) assignGroup.date = assignment.date;

      if (assignGroup.date !== assignment.date) {
        //save and reset
        this.assignmentGroups.push(assignGroup);
        assignGroup = { date: assignment.date, assignments: [] };
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
    const doc = new jsPDF("landscape");

    for (let i = 0; i < this.assignmentGroups.length; i++) {
      autoTable(doc, {
        html: `#table${i}`,
        didParseCell: (data) => {
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const text = data.cell.raw["innerText"];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const localName = data.cell.raw["localName"];

          const assignType = this.assignTypeService.getAssignTypeByName(text);
          if (assignType) {
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
    this.excelService.addAsignmentsHorizontal(this.assignmentGroups);
  }
}
