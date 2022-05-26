import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { Subject } from "rxjs";
import {
  AssignmentGroup,
  AssignmentInterface,
} from "../model/assignment.model";
import { AssignmentService } from "../service/assignment.service";

@Component({
  selector: "app-selection-list",
  templateUrl: "./selection-list.component.html",
  styleUrls: ["./selection-list.component.scss"],
})
export class SelectionListComponent implements OnChanges {
  @Input("startDate") startDate: Date;
  @Input("endDate") endDate: Date;
  @Input("assignTypes") assignTypes: string[];

  #assignments: AssignmentInterface[] = [];

  assignmentGroup: AssignmentGroup[] = [];

  constructor(
    private assignTypeService: AssignTypeService,
    private roomService: RoomService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (this.startDate && this.endDate && this.assignTypes) {
      this.#assignments = [];
      this.assignmentGroup = [];
      this.filterAssignments();
      this.sortAssignmentByDate();
      this.getRelatedData();
      this.sortAssignmentByAssignTypeOrder();
    }
  }

  ngOnInit(): void {}

  /**
   * Filters the assignments based on the range date and assign types
   */
  filterAssignments() {
    this.#assignments = this.assignmentService
      .getAssignments(true)
      .filter((assignment) => this.assignTypes.includes(assignment.assignType))
      .filter(
        (assignment) =>
          new Date(assignment.date) >= new Date(this.startDate) &&
          new Date(assignment.date) <= new Date(this.endDate)
      );
  }

  sortAssignmentByDate() {
    this.#assignments = this.#assignments.sort(
      this.assignmentService.sortAssignmentsByDate
    );
  }

  sortAssignmentByAssignTypeOrder() {
    for (let ag of this.assignmentGroup) {
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

  getRelatedData() {
    let assignGroup: AssignmentGroup = { date: undefined, assignments: [] };

    let length = this.#assignments.length;

    for (let assignment of this.#assignments) {
      --length;

      if (!assignGroup.date) assignGroup.date = assignment.date;

      if (assignGroup.date !== assignment.date) {
        //save and reset
        this.assignmentGroup.push(assignGroup);
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

      if (!length) this.assignmentGroup.push(assignGroup);
    }
    console.log(this.assignmentGroup);
  }
}
