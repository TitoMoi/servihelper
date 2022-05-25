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
import { AssignmentInterface } from "../model/assignment.model";
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
  assignments: AssignmentInterface[] = [];

  constructor(
    private assignTypeService: AssignTypeService,
    private roomService: RoomService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (this.startDate && this.endDate && this.assignTypes) {
      this.filterAssignments();
      this.getRelatedData();
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

  getRelatedData() {
    for (let assignment of this.#assignments) {
      this.assignments.push({
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
    }
  }
}
