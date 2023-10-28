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
import {
  ActivatedRoute,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
} from "@angular/router";
import {
  Observable,
  Subscription,
  combineLatest,
  distinctUntilChanged,
  map,
  skip,
} from "rxjs";
import { LastDateService } from "./service/last-date.service";
import { SortService } from "app/services/sort.service";
import { RoomService } from "app/room/service/room.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { ParticipantPipe } from "../participant/pipe/participant.pipe";
import { RoomPipe } from "../room/pipe/room.pipe";
import { AssignTypePipe } from "../assigntype/pipe/assign-type.pipe";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { NgIf, NgFor, NgClass, AsyncPipe } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { TranslocoModule } from "@ngneat/transloco";
import { AssignTypeNamePipe } from "app/assigntype/pipe/assign-type-name.pipe";
import { RoomNamePipe } from "app/room/pipe/room-name.pipe";
import { OnlineService } from "app/online/service/online.service";
import { ConfigInterface } from "app/config/model/config.model";
import { RoleInterface } from "app/roles/model/role.model";
import { ConfigService } from "app/config/service/config.service";

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
    AsyncPipe,
    TranslocoLocaleModule,
    AssignTypePipe,
    AssignTypeNamePipe,
    RoomPipe,
    RoomNamePipe,
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

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  inOnline = this.onlineService.getOnline().isOnline;

  allowedAssignTypesIds = [];
  config$: Observable<ConfigInterface> = this.configService.config$;
  roles$: Observable<RoleInterface[]> = this.config$.pipe(map((config) => config.roles));
  currentRoleId$: Observable<string> = this.config$.pipe(
    map((config) => config.role),
    distinctUntilChanged()
  );

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
    private lastDateService: LastDateService,
    private sortService: SortService,
    private onlineService: OnlineService,
    private configService: ConfigService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.getAssignments();
  }

  async getAssignments() {
    this.assignments = await this.assignmentService.getAssignments();
  }

  //first load or Admin
  getAllAssignTypesIds() {
    return this.assignTypeService.getAssignTypes()?.map((at) => at.id);
  }

  ngOnInit() {
    this.subscription.add(
      this.currentRoleId$.pipe(skip(1)).subscribe(() => {
        this.router.navigateByUrl("home").then(() =>
          this.router.navigate(["assignment/create"], {
            skipLocationChange: true,
            queryParams: { prev: "home" },
          })
        );
      })
    );

    //prepare emissions, emits also the first time
    this.subscription.add(
      combineLatest([this.currentRoleId$, this.roles$]).subscribe(([currentRole, roles]) => {
        this.allowedAssignTypesIds =
          currentRole === "administrator"
            ? this.getAllAssignTypesIds()
            : roles.find((r) => r.id === currentRole).assignTypesId;

        this.assignments = this.assignments.filter((a) =>
          this.allowedAssignTypesIds.includes(a.assignType)
        );
      })
    );

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
