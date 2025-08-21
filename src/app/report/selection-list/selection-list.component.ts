import { AssignTypeService } from 'app/assigntype/service/assigntype.service';
import { ConfigService } from 'app/config/service/config.service';
import { PdfService } from 'app/globals/services/pdf.service';
import { SortOrderType, SortService } from 'app/globals/services/sort.service';
import { ParticipantService } from 'app/participant/service/participant.service';
import { BandNamesWithExtType } from 'app/report/model/report.model';
import { RoomService } from 'app/room/service/room.service';
import autoTable from 'jspdf-autotable';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges
} from '@angular/core';

import { TranslocoLocaleModule, TranslocoLocaleService } from '@ngneat/transloco-locale';
import {
  AssignmentGroupInterface,
  AssignmentInterface,
  AssignmentReportInterface
} from 'app/assignment/model/assignment.model';
import { AssignmentService } from 'app/assignment/service/assignment.service';
import { AssignTypePipe } from '../../assigntype/pipe/assign-type.pipe';

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@ngneat/transloco';
import { AssignTypeNamePipe } from 'app/assigntype/pipe/assign-type-name.pipe';
import { ExportService } from 'app/globals/services/export.service';
import { PublicThemeService } from 'app/public-theme/service/public-theme.service';
import { RoomNamePipe } from 'app/room/pipe/room-name.pipe';
import { isSameMonth } from 'date-fns';
import { readFileSync } from 'fs-extra';
import jsPDF from 'jspdf';
import path from 'path';

@Component({
  selector: 'app-selection-list',
  templateUrl: './selection-list.component.html',
  styleUrls: ['./selection-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslocoModule,
    MatIconModule,
    MatTooltipModule,
    TranslocoLocaleModule,
    AssignTypePipe,
    AssignTypeNamePipe,
    RoomNamePipe
  ]
})
export class SelectionListComponent implements OnChanges {
  assignTypeService = inject(AssignTypeService);
  configService = inject(ConfigService);
  private roomService = inject(RoomService);
  private participantService = inject(ParticipantService);
  private assignmentService = inject(AssignmentService);
  private publicThemeService = inject(PublicThemeService);
  private sortService = inject(SortService);
  private pdfService = inject(PdfService);
  private exportService = inject(ExportService);
  private translocoLocaleService = inject(TranslocoLocaleService);
  private cdr = inject(ChangeDetectorRef);

  @Input() selectedDates: Date[];
  @Input() assignTypes: string[];
  @Input() rooms: string[];
  @Input() order: SortOrderType;

  defaultReportFontSize = this.configService.getConfig().defaultReportFontSize + 'px';
  defaultReportDateFormat = this.configService.getConfig().defaultReportDateFormat;
  defaultReportDateColor = this.configService.getConfig().defaultReportDateColor;

  reportTitle = this.configService.getConfig().reportTitle;

  assignmentGroups: AssignmentGroupInterface[] = [];

  #assignments: AssignmentInterface[] = [];
  ngOnChanges() {
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
   * Filters the assignments based on the range date and assign types and rooms
   */
  async filterAssignments() {
    this.#assignments = await this.assignmentService.getAssignments(true);

    this.#assignments = this.#assignments.filter(
      assignment =>
        this.assignTypes.includes(assignment.assignType) &&
        this.rooms.includes(assignment.room) &&
        this.selectedDates.some(
          date => new Date(date).getTime() === new Date(assignment.date).getTime()
        )
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
      assignments: []
    };

    let currentDate;
    let firstRoomId;

    for (const assignment of this.#assignments) {
      if (!currentDate) {
        currentDate = assignment.date;
      }
      if (!firstRoomId) {
        firstRoomId = assignment.room;
      }

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
          assignments: []
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
        footerNote: ''
      });
    }
    //last assign group who is out of the loop
    if (assignGroup.assignments.length) {
      this.assignmentGroups.push(assignGroup);
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
      orientation: 'portrait',
      format: [210, 14400]
    });

    const font = this.pdfService.getFontForLang();

    let totalHeight = 0;

    for (let i = 0; i < this.assignmentGroups.length; i++) {
      autoTable(doc, {
        html: `#table${i}`,
        styles: { font, fontSize: 11 },
        theme: 'plain',
        margin: { vertical: 10 },
        didParseCell: data => {
          const id = data.cell.raw['id'];
          const localName = data.cell.raw['localName'];
          const assignType = this.assignTypeService.getAssignType(id);
          if (assignType) {
            data.cell.styles.fontStyle = 'bold';
            return;
          }
          //date
          if (localName === 'th') {
            data.cell.styles.fontStyle = 'bold';
            return;
          }
        },
        didDrawPage: data => {
          totalHeight = data.cursor.y;
        }
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
    this.exportService.toPng('toPngDivId', 'assignments');
  }

  getPdfSheet() {
    return this.pdfService.getJsPdf({
      orientation: 'portrait',
      format: 'a4'
    });
  }

  getFormatedDate(date: Date) {
    return this.translocoLocaleService.localizeDate(date, this.translocoLocaleService.getLocale(), {
      dateStyle: this.defaultReportDateFormat
    });
  }

  /**
   * @param hasMultipleRooms if true, will substract a diferent value to the initial pageWidth
   */
  getMaxWidth(hasMultipleRooms: boolean, compressed: boolean) {
    return (
      this.pdfService.getPageWidth() -
      this.pdfService.getInitialWidth(compressed) -
      this.pdfService.getEndingWidth(compressed) -
      (hasMultipleRooms ? 100 : 60) // If you modify this, you also have to compensate in getMaxWidthNames
    );
  }

  /**
   *
   * @param hasMultipleRooms if true, will substract a diferent value to the initial pageWidth
   */
  getMaxWidthNames(hasMultipleRooms: boolean, compressed: boolean) {
    return (
      this.pdfService.getPageWidth() -
      this.pdfService.getInitialWidth(compressed) -
      this.pdfService.getEndingWidth(compressed) -
      (hasMultipleRooms ? 130 : 120) // If you modify this, you also have to compensate in getMaxWidth
    );
  }

  groupBelongsToMonthOf5Weeks(
    currentAg: AssignmentGroupInterface,
    agList: AssignmentGroupInterface[]
  ) {
    let weeks = 0;
    for (const ag of agList) {
      if (isSameMonth(currentAg.assignments[0].date, ag.assignments[0].date)) {
        weeks++;
      }
    }
    return weeks === 5;
  }

  hasMultipleRooms(ag: AssignmentGroupInterface): boolean {
    const rooms = ag.assignments.map(a => a.room);
    const roomsSet = new Set(rooms);
    return roomsSet.size > 1;
  }

  getRooms(ag: AssignmentGroupInterface) {
    const rooms = ag.assignments.map(a => a.room);
    const roomsSet = new Set(rooms);
    return [...roomsSet];
  }

  getParticipantsNames(a: AssignmentReportInterface, hasMultipleRooms: boolean) {
    if (!hasMultipleRooms) {
      return a.principal.name + (a.assistant ? '/ ' + a.assistant.name : '');
    }
    return a.principal.name + (a.assistant ? '/\n' + a.assistant.name : '');
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
    a: AssignmentReportInterface
  ): number {
    y = y - 4; //Rectangles draw to bottom so we need to move the pointer up
    doc.setFillColor(a.assignType.color);
    doc.rect(x, y, 180, 4, 'F');
    const image = path.join(this.configService.iconsFilesPath, imageName);
    const uint8array = new Uint8Array(readFileSync(image));
    doc.addImage(uint8array, 'png', x, y, 4, 4);
    y = y + 9;
    return y;
  }

  /**
   * The pdf report that is digitally distributed and also printed
   * @param isWeekend if true, will generate a weekend report
   * @param compressed if true, will compress all the space in the sheet
   */
  // eslint-disable-next-line complexity
  toPdfBoard(isWeekend = false, compressed = false) {
    const assignmentGroupsBackup = [...this.assignmentGroups];

    this.getRelatedData(true);

    const doc = this.getPdfSheet();

    const x = this.pdfService.getInitialWidth(compressed);
    let y = this.pdfService.getInitialHeight(compressed);

    doc.setFont(this.pdfService.font);

    const has5Weeks = this.groupBelongsToMonthOf5Weeks(
      this.assignmentGroups[0],
      this.assignmentGroups
    );
    let weekCounter = this.pdfService.getWeekCounter(isWeekend, compressed, has5Weeks);

    for (const ag of this.assignmentGroups) {
      const has5Weeks = this.groupBelongsToMonthOf5Weeks(ag, this.assignmentGroups);
      if (!weekCounter) {
        weekCounter = this.pdfService.getWeekCounter(isWeekend, compressed, has5Weeks);
        doc.addPage('a4', 'p');
        y = this.pdfService.getInitialHeight(compressed);
      }

      //Initialize the bands
      let treasuresFromWordBand = false;
      let improvePreachingBand = false;
      let livingAsChristiansBand = false;

      //date
      const dateLocaleFormat = this.getFormatedDate(ag.assignments[0].date);

      doc.setFont(this.pdfService.font, 'bold');
      doc.setFontSize(this.pdfService.getDateFontSize(compressed));
      doc.text(dateLocaleFormat, x, y, {});

      //rooms title and content
      doc.setFontSize(this.pdfService.getTextFontSize(compressed, has5Weeks));

      const hasMultipleRooms = this.hasMultipleRooms(ag);

      const maxLineWidth = this.getMaxWidth(hasMultipleRooms, compressed);
      const maxLineWidthParticipants = this.getMaxWidthNames(hasMultipleRooms, compressed);

      if (hasMultipleRooms) {
        const [room1, room2] = this.getRooms(ag);
        doc.text(
          this.roomService.getNameOrTranslation(room1),
          x + this.getMaxWidth(hasMultipleRooms, compressed),
          y
        );
        doc.text(
          this.roomService.getNameOrTranslation(room2),
          x +
            this.getMaxWidth(hasMultipleRooms, compressed) +
            this.getMaxWidthNames(hasMultipleRooms, compressed),
          y
        );
      } else {
        const [room1] = this.getRooms(ag);
        doc.text(
          this.roomService.getNameOrTranslation(room1),
          x + this.getMaxWidth(hasMultipleRooms, compressed),
          y
        );
      }

      doc.setFont(this.pdfService.font, 'normal');
      //move the pointer to the assignments section
      y = y + (compressed ? 5 : 10);

      for (const a of ag.assignments) {
        let height = 0;

        let participantsNames = this.getParticipantsNames(a, hasMultipleRooms);

        let textLinesParticipants = doc.splitTextToSize(
          participantsNames,
          maxLineWidthParticipants
        );

        const heightParticipantNames =
          (compressed ? (has5Weeks ? 2 : 2.5) : 3.5) * (textLinesParticipants.length + 1);

        let themeOrAssignType = a.theme
          ? a.theme
          : this.assignTypeService.getNameOrTranslation(a.assignType);

        let PhraseLength = (hasMultipleRooms ? 70 : 90) - (compressed ? 21 : 0);
        //Before create text lines check the length
        if (themeOrAssignType.length > PhraseLength) {
          const shortedTheme = [];
          const words = themeOrAssignType.split(' ');
          for (const w of words) {
            if (PhraseLength - w.length > 0) {
              shortedTheme.push(w);
              PhraseLength -= w.length;
            } else {
              break;
            }
          }
          themeOrAssignType = shortedTheme.join(' ') + ' (...)';
        }

        const textLinesTheme = doc.splitTextToSize(themeOrAssignType, maxLineWidth);

        const heightTheme = (compressed ? 2 : 3.5) * (textLinesTheme.length + 1);

        height = heightTheme > heightParticipantNames ? heightTheme : heightParticipantNames;

        if (!compressed) {
          //Bands
          if (a.assignType.type === 'chairman' && isWeekend) {
            y = this.addBand(doc, x, y, 'publicspeech.png', a);
          }
          if (
            this.assignTypeService.treasuresAssignmentTypes.includes(a.assignType.type) &&
            !treasuresFromWordBand
          ) {
            y = this.addBand(doc, x, y, 'treasures.png', a);
            treasuresFromWordBand = true;
          }
          if (
            this.assignTypeService.improvePreachingAssignmentTypes.includes(a.assignType.type) &&
            !improvePreachingBand
          ) {
            y = this.addBand(doc, x, y, 'wheat.png', a);
            improvePreachingBand = true;
          }
          if (
            this.assignTypeService.liveAsChristiansAssignmentTypes.includes(a.assignType.type) &&
            !livingAsChristiansBand
          ) {
            y = this.addBand(doc, x, y, 'sheep.png', a);
            livingAsChristiansBand = true;
          }
        }
        doc.text(textLinesTheme, x, y);
        //We need to move the pointer adding the width of the text plus a margin
        doc.text(textLinesParticipants, x + this.getMaxWidth(hasMultipleRooms, compressed), y);

        if (hasMultipleRooms) {
          //Find the equivalent on room2, paint participants and remove the assignment
          // the room2 assignments are at the end of the ag because are sorted
          const assign = ag.assignments.find(
            assi => assi.room.id !== a.room.id && assi.assignType.type === a.assignType.type
          );
          const index = ag.assignments.findIndex(
            assi => assi.room.id !== a.room.id && assi.assignType.type === a.assignType.type
          );
          if (assign) {
            participantsNames = this.getParticipantsNames(assign, hasMultipleRooms);
            textLinesParticipants = doc.splitTextToSize(
              participantsNames,
              maxLineWidthParticipants
            );
            //We need to move the pointer adding the width of the text
            //plus the width of the participant text plus a margin
            doc.text(
              textLinesParticipants,
              x +
                this.getMaxWidth(hasMultipleRooms, compressed) +
                this.getMaxWidthNames(hasMultipleRooms, compressed),
              y
            );
            ag.assignments.splice(index, 1);
          }
        }

        //Prepare the pointer for the next assignment
        y = y + height;
      }
      //Separator betweek weeks
      y = y + (compressed ? 2.5 : 5);
      weekCounter--;
    }

    //Restore related data so the html wont jump
    this.assignmentGroups = assignmentGroupsBackup;

    doc.save(isWeekend ? 'assignmentsWeekend' : 'assignmentsMidweek');
  }
}
