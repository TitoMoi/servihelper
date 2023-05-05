import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ConfigService } from "app/config/service/config.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { ExcelService } from "app/services/excel.service";
import { SortOrderType, SortService } from "app/services/sort.service";
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
} from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { PdfService } from "app/services/pdf.service";
import { AssignTypePipe } from "../../assigntype/pipe/assign-type.pipe";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { NgFor, NgIf } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";

@Component({
  selector: "app-selection-list-hor",
  templateUrl: "./selection-list-hor.component.html",
  styleUrls: ["./selection-list-hor.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoModule,
    MatIconModule,
    MatTooltipModule,
    NgFor,
    NgIf,
    TranslocoLocaleModule,
    AssignTypePipe,
  ],
})
export class SelectionListHorComponent implements OnChanges {
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
   * Filters the assignments based on the range date and assign types
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

  sortAssignmentByAssignTypeOrder() {
    for (const ag of this.assignmentGroups) {
      ag.assignments.sort(
        (a: AssignmentReportInterface, b: AssignmentReportInterface): number => {
          const orderA = this.assignTypeService.getAssignType(a.assignType.id).order;
          const orderB = this.assignTypeService.getAssignType(b.assignType.id).order;

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
        new Date(assignGroup.date).toISOString() !== new Date(assignment.date).toISOString()
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
        styles: { font, fontSize: 13 },
        theme: "plain",
        margin: firstTable ? { top: 30 } : undefined,
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
          if (localName === "th" && !assignType) {
            //the "or" condition is necessary, otherwise pdf is not showed in acrobat reader
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
    this.excelService.addAsignmentsHorizontal(this.assignmentGroups);
  }
}
