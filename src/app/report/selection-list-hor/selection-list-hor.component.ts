import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ConfigService } from "app/config/service/config.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { SortOrderType, SortService } from "app/services/sort.service";
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

import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";
import { ExportService } from "app/services/export.service";
import { PublicThemeService } from "app/public-theme/service/public-theme.service";
import { AssignTypeNamePipe } from "app/assigntype/pipe/assign-type-name.pipe";
import { RoomNamePipe } from "app/room/pipe/room-name.pipe";

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
    TranslocoLocaleModule,
    AssignTypePipe,
    AssignTypeNamePipe,
    RoomNamePipe
],
})
export class SelectionListHorComponent implements OnChanges {
  @Input() selectedDates: Date[];
  @Input() assignTypes: string[];
  @Input() rooms: string[];
  @Input() order: SortOrderType;

  defaultReportFontSizeHorizontal =
    this.configService.getConfig().defaultReportFontSizeHorizontal + "px";
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
    private publicThemeService: PublicThemeService,
    private pdfService: PdfService,
    private exportService: ExportService,
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

  hasAssignments() {
    return this.#assignments.length;
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
    this.assignmentGroups = [];

    let assignGroup: AssignmentGroupInterface = {
      assignments: [],
    };

    let currentDate;
    let firstRoomId;
    for (const assignment of this.#assignments) {
      if (!currentDate) currentDate = assignment.date;
      if (!firstRoomId) firstRoomId = assignment.room;

      if (
        new Date(currentDate).toISOString() !== new Date(assignment.date).toISOString() ||
        firstRoomId !== assignment.room
      ) {
        //save the ag and prepare another ag
        this.assignmentGroups.push(assignGroup);
        //reset defaults
        currentDate = assignment.date;
        firstRoomId = assignment.room;
        assignGroup = {
          assignments: [],
        };
      }

      assignGroup.assignments.push({
        id: assignment.id,
        date: assignment.date,
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
    }
    //last assign group who is out of the loop
    if (assignGroup.assignments.length) this.assignmentGroups.push(assignGroup);
  }

  toPdfForPrint() {
    const doc = this.pdfService.getJsPdf({ orientation: "landscape" });

    const font = this.pdfService.getFontForLang();

    doc.text(this.reportTitle, doc.internal.pageSize.width / 2, 8, {
      align: "center",
    });

    for (let i = 0; i < this.assignmentGroups.length; i++) {
      const tableId = `table${i}`;
      autoTable(doc, {
        html: "#" + tableId,
        styles: { font, fontSize: 10, cellPadding: 1.5 },
        theme: "plain",
        margin: { vertical: 4, horizontal: 4 },
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
    }
    doc.save("assignmentsLandscape");
  }

  async toPng() {
    this.exportService.toPng("toPngDivId", "assignments");
  }
}
