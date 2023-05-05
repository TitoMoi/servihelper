import {
  AssignmentInterface,
  AssignmentOperationInterface,
  AssignmentTableInterface,
} from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";

import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { ActivatedRoute, RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { Subscription } from "rxjs";
import { LastDateService } from "./service/last-date.service";
import { SortService } from "app/services/sort.service";
import { RoomService } from "app/room/service/room.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { NoteService } from "app/note/service/note.service";
import { ParticipantPipe } from "../participant/pipe/participant.pipe";
import { RoomPipe } from "../room/pipe/room.pipe";
import { AssignTypePipe } from "../assigntype/pipe/assign-type.pipe";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { NgIf, NgFor, NgClass } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { TranslocoModule } from "@ngneat/transloco";

@Component({
  selector: "app-assignment",
  templateUrl: "./assignment.component.html",
  styleUrls: ["./assignment.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    RouterOutlet,
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    NgIf,
    MatIconModule,
    MatTooltipModule,
    NgFor,
    NgClass,
    TranslocoLocaleModule,
    AssignTypePipe,
    RoomPipe,
    ParticipantPipe,
  ],
})
export class AssignmentComponent implements OnInit, OnDestroy, AfterViewChecked {
  //In memory assignments
  assignments: AssignmentInterface[] = [];

  //The assignments
  assignmentsTable: AssignmentTableInterface[] = [];

  rows: NodeListOf<Element> = undefined;

  paginationEndIndex = 25;

  observer: IntersectionObserver = new IntersectionObserver((entries) => {
    //observe the last row
    for (const entry of entries) {
      if (entry.isIntersecting) {
        let assignmentsPage = this.getAssignmentsSlice(
          this.paginationEndIndex,
          this.paginationEndIndex + 25
        );

        if (assignmentsPage?.length) {
          //Remove duplicates, this is because we can add an assignment and move the pagination pointer
          assignmentsPage = assignmentsPage.filter(
            (a) => !this.assignmentsTable.some((at) => at.id === a.id)
          );

          this.assignmentsTable = [
            ...this.assignmentsTable,
            ...this.prepareRowExtendedValues(assignmentsPage),
          ];

          this.sortAndUpdateSeparator();
        }

        this.observer.unobserve(entry.target);
        this.cdr.detectChanges();
      }
    }
  });

  subscription: Subscription = new Subscription();

  constructor(
    public activatedRoute: ActivatedRoute,
    private assignmentService: AssignmentService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private noteService: NoteService,
    private lastDateService: LastDateService,
    private sortService: SortService,
    private cdr: ChangeDetectorRef
  ) {
    this.getAssignments();
  }

  async getAssignments() {
    this.assignments = await this.assignmentService.getAssignments();
  }

  ngOnInit() {
    const assignmentsPage = this.getAssignmentsSlice(0, this.paginationEndIndex);
    this.assignmentsTable = this.prepareRowExtendedValues(assignmentsPage);

    this.sortAndUpdateSeparator();

    //Listen for assignments updates (create, update, delete)
    this.subscription.add(
      this.assignmentService.assignment$.subscribe(
        (assignmentOperation: AssignmentOperationInterface) => {
          const assignment = assignmentOperation.assignment;
          switch (assignmentOperation.operationType) {
            case "create":
              this.addAssignmentToTable(assignment);
              break;
            case "update":
              this.updateAssignmentInTable(assignment);
              break;
            case "delete":
              this.deleteAssignmentInTable(assignment);
              break;
          }
        }
      )
    );
  }

  ngAfterViewChecked(): void {
    this.queryAllMatRows();

    //keep observing until we reach the assignments length
    if (this.assignments.length && this.rows.length !== this.assignments.length)
      this.observer.observe(this.rows[this.rows.length - 1]);
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
    this.subscription.unsubscribe();
  }

  getAssignmentsSlice(start, end): AssignmentInterface[] {
    const assignmentsSlice = this.assignments.slice(start, end);
    //update pointer for next pagination iteration
    this.paginationEndIndex = end;
    return assignmentsSlice;
  }

  addAssignmentToTable(assignment: AssignmentInterface) {
    const assignmentTable: AssignmentTableInterface[] = this.prepareRowExtendedValues([
      assignment,
    ]);
    this.assignmentsTable.push(assignmentTable[0]);

    this.sortAndUpdateSeparator();
  }

  updateAssignmentInTable(assignment: AssignmentInterface) {
    const index = this.assignmentsTable.findIndex(
      (dataElement: AssignmentTableInterface) => dataElement.id === assignment.id
    );
    //Prepare assignment
    const assignmentTable: AssignmentTableInterface[] = this.prepareRowExtendedValues([
      assignment,
    ]);
    //swap the assignment
    this.assignmentsTable[index] = assignmentTable[0];
    this.sortAndUpdateSeparator();
  }

  deleteAssignmentInTable(assignment) {
    this.assignmentsTable = this.assignmentsTable.filter((da) => da.id !== assignment.id);
    this.sortAndUpdateSeparator();
  }

  sortAndUpdateSeparator() {
    //sort
    this.assignmentsTable = this.sortService.sortAssignmentsByDateThenRoomAndAssignType(
      this.assignmentsTable,
      "Desc"
    );

    //Add separator
    for (const tableRow of this.assignmentsTable) {
      //reset
      tableRow.hasDateSeparator = false;
      if (
        new Date(tableRow.date).getTime() !==
        new Date(this.lastDateService.lastDashedDate).getTime()
      ) {
        tableRow.hasDateSeparator = true;
        //update last dashed date
        this.lastDateService.lastDashedDate = tableRow.date;
      }
    }
  }

  getBorderLeftColor(color: string) {
    return `20px solid ${color ? color : "#FFF"}`;
  }

  /** query is based on id because we cannot rely on css classes as they can change
   */
  queryAllMatRows() {
    this.rows = document.querySelectorAll("#imageId");
  }

  trackByIdFn(index, assignment: AssignmentTableInterface) {
    return assignment.id;
  }

  prepareRowExtendedValues(
    assignmentsPage: AssignmentInterface[]
  ): AssignmentTableInterface[] {
    const assignmentsTable: AssignmentTableInterface[] = [];

    for (const assignment of assignmentsPage) {
      const assignmentsTableInterface: AssignmentTableInterface = {
        id: assignment.id,
        date: assignment.date,
        room: assignment.room,
        assignType: assignment.assignType,
        principal: assignment.principal,
        assistant: assignment.assistant,
        theme: assignment.theme,
        onlyWoman: assignment.onlyWoman,
        onlyMan: assignment.onlyMan,
        onlyExternals: assignment.onlyExternals,
        footerNote: assignment.footerNote,
        hasDateSeparator: undefined,
        hasBeenClicked: undefined,
      };
      assignmentsTable.push(assignmentsTableInterface);
    }

    //Update the view
    return assignmentsTable;
  }

  highlightRow(event, element: AssignmentTableInterface) {
    event.stopPropagation();
    element.hasBeenClicked = true;
  }

  preventDefault(event) {
    event.stopPropagation();
  }

  exportCsv() {
    let data = "";
    let headers = "";
    const rows = [];
    const keys = Object.keys(this.assignmentsTable[0]);
    for (const key of keys) {
      headers = headers + key + ";";
    }
    headers = headers + "\n";
    rows.push(headers);

    for (const assign of this.assignmentsTable) {
      data = ""; //reset row
      for (const key of keys) {
        switch (key) {
          case "room":
            data = data + this.roomService.getRoomNameById(assign[key]) + ";";
            break;
          case "assignType":
            data = data + this.assignTypeService.getAssignTypeNameById(assign[key]) + ";";
            break;
          case "principal":
            data = data + this.participantService.getParticipant(assign[key]).name + ";";
            break;
          case "assistant":
            this.participantService.getParticipant(assign[key]);
            data = data + this.participantService.getParticipant(assign[key])?.name + ";";
            break;
          case "footerNote":
            data = data + this.noteService.getNote(assign[key])?.editorHTML + ";";
            break;

          default:
            data = data + assign[key] + ";";
            break;
        }
      }
      data = data + "\n";
      rows.push(data);
    }
    const a: any = document.createElement("a");
    const file = new Blob(rows, { type: "text/csv" });
    a.href = URL.createObjectURL(file);
    a.download = "assignments.csv";
    a.click();
  }
}
