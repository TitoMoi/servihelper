import {
  AssignmentInterface,
  AssignmentTableInterface,
} from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { SortService } from "app/services/sort.service";

import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "app-assignment",
  templateUrl: "./assignment.component.html",
  styleUrls: ["./assignment.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  //In memory assignments
  assignments: AssignmentInterface[] = [];

  //The assignments with display values
  displayAssignments;

  dayIndex = 0;
  lastItemsPerPageIndex = 0;
  //For each day has the length of assignments
  dateAndAssignmentsLength =
    this.assignmentService.getDateAndAssignmentsLength();

  rows: NodeListOf<Element> = undefined;

  observer: IntersectionObserver = new IntersectionObserver((entries) => {
    //observe the last row
    for (const entry of entries) {
      if (entry.isIntersecting) {
        let itemsPerPage = 0;
        //Get a 7 days assignments, days can jump as could not be assignments between
        for (let i = this.dayIndex; i < this.dayIndex + 7; i++) {
          itemsPerPage += this.dateAndAssignmentsLength[i];
        }

        const assignmentsPage = this.assignments.slice(
          this.lastItemsPerPageIndex,
          this.lastItemsPerPageIndex + itemsPerPage
        );

        //update index for next week
        this.dayIndex += 7;
        //update last items per page
        this.lastItemsPerPageIndex = this.lastItemsPerPageIndex + itemsPerPage;

        this.displayAssignments = [
          ...this.displayAssignments,
          ...this.getDisplayValues(assignmentsPage),
        ];
        this.observer.unobserve(entry.target);
        this.cdr.detectChanges();
      }
    }
  });

  subscription: Subscription = new Subscription();

  constructor(
    public activatedRoute: ActivatedRoute,
    private assignmentService: AssignmentService,
    private participantService: ParticipantService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private sortService: SortService,
    private cdr: ChangeDetectorRef
  ) {
    this.getAssignments();
  }

  async getAssignments() {
    this.assignments = await this.assignmentService.getAssignments();
  }

  ngOnInit() {
    //Initial pagination, get a week of assignments
    let itemsPerPage = 0;
    for (let i = this.dayIndex; i < this.dayIndex + 7; i++) {
      itemsPerPage += this.dateAndAssignmentsLength[i];
    }
    const assignmentsPage = this.assignments.slice(0, itemsPerPage); //+1 for the slice method that doesnt include last
    this.displayAssignments = this.getDisplayValues(assignmentsPage);

    //update index for next week
    this.dayIndex += 7;
    //update index of last items per page
    this.lastItemsPerPageIndex = this.lastItemsPerPageIndex + itemsPerPage; //prepare index for next day

    //Listen for assignments updates
    this.subscription.add(
      this.assignmentService.assignmentHasChanged$.subscribe(
        (assignment: AssignmentInterface) => {
          const index = this.displayAssignments.findIndex(
            (dataElement: AssignmentTableInterface) =>
              dataElement.id === assignment.id
          );
          //Prepare assignment display values
          const assignmentTable: AssignmentTableInterface[] =
            this.getDisplayValues([assignment]);
          //swap the assignment
          this.displayAssignments[index] = assignmentTable[0];
        }
      )
    );
  }

  ngAfterViewChecked(): void {
    this.queryAllMatRows();

    //keep observing until we reach the assignments length
    if (this.rows.length !== this.assignments.length)
      this.observer.observe(this.rows[this.rows.length - 1]);
  }

  ngOnDestroy(): void {
    /*  this.observer.disconnect(); */
    this.subscription.unsubscribe();
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

  getDisplayValues(
    assignmentsPage: AssignmentInterface[]
  ): AssignmentTableInterface[] {
    const assignmentsTable: AssignmentTableInterface[] = [];

    const assignmentsSorted =
      this.sortService.sortAssignmentsByRoomAndAssignType(assignmentsPage);

    for (const assignment of assignmentsSorted) {
      //assistant is optional
      const assistant = this.participantService.getParticipant(
        assignment.assistant
      );

      const assignType = this.assignTypeService.getAssignType(
        assignment.assignType
      );

      //Populate datasource, values are in order
      assignmentsTable.push({
        id: assignment.id,
        date: assignment.date,
        hasDateSeparator: undefined,
        hasBeenClicked: undefined,
        room: this.roomService.getRoom(assignment.room).name,
        assignType: assignType.name,
        assignTypeColor: assignType.color,
        theme: assignment.theme,
        principal: this.participantService.getParticipant(assignment.principal)
          .name,
        assistant: assistant ? assistant.name : undefined,
      });
    }

    //Separate dates from one day to another with a black dashed border
    let filteredLastDate: Date = assignmentsTable[0]?.date;
    for (const tableRow of assignmentsTable) {
      if (
        new Date(tableRow.date).getTime() !==
        new Date(filteredLastDate).getTime()
      ) {
        tableRow.hasDateSeparator = true;
        filteredLastDate = tableRow.date;
      }
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
    const keys = Object.keys(this.displayAssignments[0]);
    for (const key of keys) {
      headers = headers + key + ";";
    }
    headers = headers + "\n";
    rows.push(headers);

    for (const assign of this.displayAssignments) {
      data = ""; //reset row
      for (const key of keys) {
        data = data + assign[key] + ";";
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
