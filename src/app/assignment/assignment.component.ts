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
import { ParticipantPipe } from "../participant/pipe/participant.pipe";
import { RoomPipe } from "../room/pipe/room.pipe";
import { AssignTypePipe } from "../assigntype/pipe/assign-type.pipe";
import { TranslocoDatePipe } from "@ngneat/transloco-locale";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { NgClass, AsyncPipe } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { TranslocoDirective } from "@ngneat/transloco";
import { AssignTypeNamePipe } from "app/assigntype/pipe/assign-type-name.pipe";
import { RoomNamePipe } from "app/room/pipe/room-name.pipe";
import { OnlineService } from "app/online/service/online.service";
import { ConfigService } from "app/config/service/config.service";
import { format } from "date-fns";

@Component({
  selector: "app-assignment",
  templateUrl: "./assignment.component.html",
  styleUrls: ["./assignment.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    RouterOutlet,
    TranslocoDirective,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatTooltipModule,
    NgClass,
    AsyncPipe,
    TranslocoDatePipe,
    AssignTypePipe,
    AssignTypeNamePipe,
    RoomPipe,
    RoomNamePipe,
    ParticipantPipe,
  ],
})
export class AssignmentComponent implements OnInit, OnDestroy, AfterViewChecked {
  //In memory assignments
  assignments: AssignmentInterface[] = this.assignmentService.getAssignments();

  //The assignments
  assignmentsTable: AssignmentTableInterface[] = [];

  rows: NodeListOf<Element> = undefined;

  paginationEndIndex = 25;

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  inOnline = this.onlineService.getOnline().isOnline;

  allowedAssignTypesIds = [];

  config = this.configService.config;

  roles = this.config.roles;

  currentRoleId: string = this.config.role;

  // To know when the role changes
  role$ = this.configService.role$;

  isAdmin = false;

  observer: IntersectionObserver;

  subscription: Subscription = new Subscription();

  constructor(
    public activatedRoute: ActivatedRoute,
    private assignmentService: AssignmentService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private lastDateService: LastDateService,
    private sortService: SortService,
    private onlineService: OnlineService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef,
  ) {}

  //first load or Admin
  getAllAssignTypesIds() {
    return this.assignTypeService.getAssignTypes().map((at) => at.id);
  }

  ngOnInit() {
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
        },
      ),
    );

    //React to role changes
    this.subscription.add(
      this.role$.subscribe(() => {
        this.observer.disconnect();
        this.assignmentsTable = [];
        this.assignments = this.assignmentService.getAssignments();

        this.isAdmin = this.configService.isAdminRole();

        this.allowedAssignTypesIds = this.isAdmin
          ? this.getAllAssignTypesIds()
          : this.configService.getRole(this.configService.role).assignTypesId;

        this.assignments = this.assignments.filter(
          (a) =>
            this.allowedAssignTypesIds.includes(a.assignType) && this.isWeekdayAllowed(a.date),
        );

        const assignmentsPage = this.getAssignmentsSlice(0, this.paginationEndIndex);
        this.assignmentsTable = this.prepareRowExtendedValues(assignmentsPage);

        this.sortAndUpdateSeparator();

        this.createObserver();

        this.cdr.detectChanges();
      }),
    );

    // the same as when the role changes but this is first load
    this.isAdmin = this.configService.isAdminRole();

    this.allowedAssignTypesIds = this.isAdmin
      ? this.getAllAssignTypesIds()
      : this.configService.getRole(this.configService.role).assignTypesId;

    this.assignments = this.assignments.filter(
      (a) =>
        this.allowedAssignTypesIds.includes(a.assignType) && this.isWeekdayAllowed(a.date),
    );

    const assignmentsPage = this.getAssignmentsSlice(0, this.paginationEndIndex);
    this.assignmentsTable = this.prepareRowExtendedValues(assignmentsPage);

    this.sortAndUpdateSeparator();

    this.createObserver();

    this.cdr.detectChanges();
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

  createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      //observe the last row
      for (const entry of entries) {
        if (entry.isIntersecting) {
          let assignmentsPage = this.getAssignmentsSlice(
            this.paginationEndIndex,
            this.paginationEndIndex + 25,
          );

          if (assignmentsPage?.length) {
            //Remove duplicates, this is because we can add an assignment and move the pagination pointer
            assignmentsPage = assignmentsPage.filter(
              (a) => !this.assignmentsTable.some((at) => at.id === a.id),
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
  }

  isWeekdayAllowed(date: Date) {
    const dayName = format(date, "EEEE").toLowerCase();
    const role = this.configService.getRole(this.configService.getCurrentRoleId());
    return role[dayName];
  }

  isCreateAssignmentDisabled() {
    return !(
      this.roomService.getRoomsLength() &&
      this.assignTypeService.getAssignTypesLength() &&
      this.participantService.getParticipantsLength()
    );
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
      (dataElement: AssignmentTableInterface) => dataElement.id === assignment.id,
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
    if (this.assignmentsTable.length) {
      this.assignmentsTable = this.sortService.sortAssignmentsByDateThenRoomAndAssignType(
        this.assignmentsTable,
        "Desc",
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
    assignmentsPage: AssignmentInterface[],
  ): AssignmentTableInterface[] {
    const assignmentsTable: AssignmentTableInterface[] = [];

    for (const assignment of assignmentsPage) {
      const assignmentsTableInterface: AssignmentTableInterface = {
        id: assignment.id,
        date: assignment.date,
        room: assignment.room,
        assignType: assignment.assignType,
        principal: assignment.principal,
        group: assignment.group,
        assistant: assignment.assistant,
        theme: assignment.theme,
        isPTheme: assignment.isPTheme,
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
}
