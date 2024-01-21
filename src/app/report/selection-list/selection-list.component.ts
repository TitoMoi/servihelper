import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ConfigService } from "app/config/service/config.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { SortOrderType, SortService } from "app/services/sort.service";
import { PdfService } from "app/services/pdf.service";
import autoTable from "jspdf-autotable";
import { BandNamesWithExtType } from "app/report/model/report.model";

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
import { AssignTypePipe } from "../../assigntype/pipe/assign-type.pipe";
import { TranslocoLocaleModule, TranslocoLocaleService } from "@ngneat/transloco-locale";

import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";
import { ExportService } from "app/services/export.service";
import { PublicThemeService } from "app/public-theme/service/public-theme.service";
import { AssignTypeNamePipe } from "app/assigntype/pipe/assign-type-name.pipe";
import { RoomNamePipe } from "app/room/pipe/room-name.pipe";
import { readFileSync } from "fs-extra";
import path from "path";
import jsPDF from "jspdf";

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
    TranslocoLocaleModule,
    AssignTypePipe,
    AssignTypeNamePipe,
    RoomNamePipe,
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
    private pdfService: PdfService,
    private exportService: ExportService,
    private translocoLocaleService: TranslocoLocaleService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnChanges(changes: SimpleChanges) {
    if (this.selectedDates.length && this.assignTypes) {
      this.#assignments = [];
      this.assignmentGroups = [];
      this.filterAssignments().then(() => {
        this.#assignments = this.sortService.sortAssignmentsByDateThenRoomAndAssignType(
          this.#assignments,
          this.order,
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
   * Filters the assignments based on the range date and assign types and rooms
   */
  async filterAssignments() {
    this.#assignments = await this.assignmentService.getAssignments(true);

    this.#assignments = this.#assignments.filter(
      (assignment) =>
        this.assignTypes.includes(assignment.assignType) &&
        this.rooms.includes(assignment.room) &&
        this.selectedDates.some(
          (date) => new Date(date).getTime() === new Date(assignment.date).getTime(),
        ),
    );
  }

  getBorderRight(color): string {
    return `border-right: 12px solid ${color};`;
  }

  /**
   *
   * @param shouldFusionRooms if true, dont create another ag, instead add that assignment to the same ag
   */
  getRelatedData(shouldFusionRooms = false) {
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
        (firstRoomId !== assignment.room && !shouldFusionRooms)
      ) {
        //save the ag and prepare another assignGroup
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
    }
    //last assign group who is out of the loop
    if (assignGroup.assignments.length) this.assignmentGroups.push(assignGroup);
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
      format: [210, 14400],
    });

    const font = this.pdfService.getFontForLang();

    let totalHeight = 0;

    for (let i = 0; i < this.assignmentGroups.length; i++) {
      autoTable(doc, {
        html: `#table${i}`,
        styles: { font, fontSize: 11 },
        theme: "plain",
        margin: { vertical: 10 },
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
  toPdf(colorBands: boolean, isForPrint: boolean) {
    this.pdfService.toPdf(this.assignmentGroups, colorBands, isForPrint);
  }

  async toPng() {
    this.exportService.toPng("toPngDivId", "assignments");
  }

  getPdfSheet() {
    return this.pdfService.getJsPdf({
      orientation: "portrait",
      format: "a4",
    });
  }

  getFormatedDate(date: Date) {
    return this.translocoLocaleService.localizeDate(
      date,
      this.translocoLocaleService.getLocale(),
      { dateStyle: this.defaultReportDateFormat },
    );
  }

  getMaxWidth(hasMultipleRooms: boolean) {
    return (
      this.pdfService.getPageWidth() -
      this.pdfService.getInitialWidth() -
      this.pdfService.getEndingWidth() -
      (hasMultipleRooms ? 80 : 60)
    );
  }

  getMaxWidthNames(hasMultipleRooms: boolean) {
    return (
      this.pdfService.getPageWidth() -
      this.pdfService.getInitialWidth() -
      this.pdfService.getEndingWidth() -
      (hasMultipleRooms ? 140 : 120)
    );
  }

  hasMultipleRooms(ag: AssignmentGroupInterface): boolean {
    const rooms = ag.assignments.map((a) => a.room);
    const roomsSet = new Set(rooms);
    return roomsSet.size > 1;
  }

  getRooms(ag: AssignmentGroupInterface) {
    const rooms = ag.assignments.map((a) => a.room);
    const roomsSet = new Set(rooms);
    return [...roomsSet];
  }

  getParticipantsNames(a: AssignmentReportInterface, hasMultipleRooms: boolean) {
    if (!hasMultipleRooms) {
      return a.principal.name + (a.assistant ? "/ " + a.assistant.name : "");
    }
    return a.principal.name + (a.assistant ? "/\n" + a.assistant.name : "");
  }

  /**
   *
   * @param doc the jsPdf instance
   * @param y the y pointer
   * @param x the x pointer
   * @param imageName the image name with extension
   * @param a the assignment
   */
  addBand(
    doc: jsPDF,
    x: number,
    y: number,
    imageName: BandNamesWithExtType,
    a: AssignmentReportInterface,
  ): number {
    y = y - 4; //Rectangles draw to bottom so we need to move the pointer up
    doc.setFillColor(a.assignType.color);
    doc.rect(x, y, 180, 4, "F");
    const image = path.join(this.configService.iconsFilesPath, imageName);
    const uint8array = new Uint8Array(readFileSync(image));
    doc.addImage(uint8array, "png", x, y, 4, 4);
    y = y + 9;
    return y;
  }

  toPdfBoard(isWeekend = false) {
    const assignmentGroupsBackup = [...this.assignmentGroups];

    this.getRelatedData(true);

    const doc = this.getPdfSheet();

    const x = this.pdfService.getInitialWidth();
    let y = this.pdfService.getInitialHeight();

    doc.setFont(this.pdfService.font);

    let weekCounter = this.pdfService.getWeekCounter(isWeekend);

    for (const ag of this.assignmentGroups) {
      if (!weekCounter) {
        weekCounter = this.pdfService.getWeekCounter(isWeekend);
        doc.addPage("a4", "p");
        y = this.pdfService.getInitialHeight();
      }

      //Initialize the bands
      let treasuresFromWordBand = false;
      let improvePreachingBand = false;
      let livingAsChristiansBand = false;

      //date
      const dateLocaleFormat = this.getFormatedDate(ag.assignments[0].date);

      doc.setFont(this.pdfService.font, "bold");
      doc.setFontSize(this.pdfService.getDateFontSize());
      doc.text(dateLocaleFormat, x, y, {});

      //rooms title
      doc.setFontSize(this.pdfService.getTextFontSize());

      const hasMultipleRooms = this.hasMultipleRooms(ag);

      const maxLineWidth = this.getMaxWidth(hasMultipleRooms);
      const maxLineWidthParticipants = this.getMaxWidthNames(hasMultipleRooms);

      if (hasMultipleRooms) {
        const [room1, room2] = this.getRooms(ag);
        doc.text(
          this.roomService.getNameOrTranslation(room1),
          x + this.getMaxWidth(hasMultipleRooms),
          y,
        );
        doc.text(
          this.roomService.getNameOrTranslation(room2),
          x + this.getMaxWidth(hasMultipleRooms) + this.getMaxWidthNames(hasMultipleRooms),
          y,
        );
      } else {
        const [room1] = this.getRooms(ag);
        doc.text(
          this.roomService.getNameOrTranslation(room1),
          x + this.getMaxWidth(hasMultipleRooms),
          y,
        );
      }

      doc.setFont(this.pdfService.font, "normal");
      //move the pointer to the assignments section
      y = y + 10;

      for (const a of ag.assignments) {
        let height = 0;

        let participantsNames = this.getParticipantsNames(a, hasMultipleRooms);

        let textLinesParticipants = doc.splitTextToSize(
          participantsNames,
          maxLineWidthParticipants,
        );

        const heightParticipantNames = 3.5 * (textLinesParticipants.length + 1);

        let themeOrAssignType = a.theme
          ? a.theme
          : this.assignTypeService.getNameOrTranslation(a.assignType);

        let wordLength = hasMultipleRooms ? 60 : 90;
        //Before create text lines check the length
        if (themeOrAssignType.length > wordLength) {
          const shortedTheme = [];
          const words = themeOrAssignType.split(" ");
          for (const w of words) {
            if (wordLength - w.length > 0) {
              shortedTheme.push(w);
              wordLength -= w.length;
            } else {
              break;
            }
          }
          themeOrAssignType = shortedTheme.join(" ") + " (...)";
        }

        const textLinesTheme = doc.splitTextToSize(themeOrAssignType, maxLineWidth);

        const heightTheme = 3.5 * (textLinesTheme.length + 1);

        height = heightTheme > heightParticipantNames ? heightTheme : heightParticipantNames;
        //Bands
        if (a.assignType.type === "chairman" && isWeekend) {
          y = this.addBand(doc, x, y, "publicspeech.png", a);
        }
        if (
          this.assignTypeService.treasuresAssignmentTypes.includes(a.assignType.type) &&
          !treasuresFromWordBand
        ) {
          y = this.addBand(doc, x, y, "treasures.png", a);
          treasuresFromWordBand = true;
        }
        if (
          this.assignTypeService.improvePreachingAssignmentTypes.includes(a.assignType.type) &&
          !improvePreachingBand
        ) {
          y = this.addBand(doc, x, y, "wheat.png", a);
          improvePreachingBand = true;
        }
        if (
          this.assignTypeService.liveAsChristiansAssignmentTypes.includes(a.assignType.type) &&
          !livingAsChristiansBand
        ) {
          y = this.addBand(doc, x, y, "sheep.png", a);
          livingAsChristiansBand = true;
        }
        doc.text(textLinesTheme, x, y);
        //We need to move the pointer adding the width of the text plus a margin
        doc.text(textLinesParticipants, x + this.getMaxWidth(hasMultipleRooms), y);

        if (hasMultipleRooms) {
          //Find the equivalent on room2, paint participants and remove the assignment
          // the room2 assignments are at the end of the ag because are sorted
          const assign = ag.assignments.find(
            (assign) =>
              assign.room.id !== a.room.id && assign.assignType.type === a.assignType.type,
          );
          const index = ag.assignments.findIndex(
            (assign) =>
              assign.room.id !== a.room.id && assign.assignType.type === a.assignType.type,
          );
          if (assign) {
            participantsNames = this.getParticipantsNames(assign, hasMultipleRooms);
            textLinesParticipants = doc.splitTextToSize(
              participantsNames,
              maxLineWidthParticipants,
            );
            //We need to move the pointer adding the width of the text
            //plus the width of the participant text plus a margin
            doc.text(
              textLinesParticipants,
              x + this.getMaxWidth(hasMultipleRooms) + this.getMaxWidthNames(hasMultipleRooms),
              y,
            );
            ag.assignments.splice(index, 1);
          }
        }

        //Prepare the pointer for the next assignment
        y = y + height;
      }
      //Separator betweek weeks
      y = y + 5;
      weekCounter--;
    }

    //Restore related data so the html wont jump
    this.assignmentGroups = assignmentGroupsBackup;

    doc.save(isWeekend ? "assignmentsWeekend" : "assignmentsMidweek");
  }
}
