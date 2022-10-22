import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { RoomService } from "app/room/service/room.service";

import { Injectable } from "@angular/core";
import { ParticipantDynamicInterface } from "app/participant/model/participant.model";

@Injectable({
  providedIn: "root",
})
export class SortService {
  constructor(
    private assignTypeService: AssignTypeService,
    private roomService: RoomService
  ) {}

  /**
   *
   * @param assignments a paginated assignments result, not all the assignments
   * @returns
   */
  sortAssignmentsByRoomAndAssignType(assignments: AssignmentInterface[]) {
    //Diferent sort, first separate date into arrays, then double sort, first room and then assign type
    const assignmentsByDate: [AssignmentInterface[]] = [[]];
    let index = 0;
    let lastDate = assignments[0]?.date;

    for (const assignment of assignments) {
      if (
        new Date(assignment.date).getTime() === new Date(lastDate).getTime()
      ) {
        assignmentsByDate[index].push(assignment);
      } else {
        lastDate = assignment.date;
        index = index + 1;
        assignmentsByDate.push([]);
        assignmentsByDate[index].push(assignment);
      }
    }

    for (let assignGroupByDate of assignmentsByDate) {
      assignGroupByDate = assignGroupByDate.sort(
        (a: AssignmentInterface, b: AssignmentInterface) => {
          const assignTypeAOrder = this.assignTypeService.getAssignType(
            a.assignType
          ).order;
          const assignTypeBOrder = this.assignTypeService.getAssignType(
            b.assignType
          ).order;
          const roomAOrder = this.roomService.getRoom(a.room).order;
          const roomBOrder = this.roomService.getRoom(b.room).order;

          if (roomAOrder === roomBOrder) {
            if (assignTypeAOrder === assignTypeBOrder) return 0;
            return assignTypeAOrder > assignTypeBOrder ? 1 : -1;
          } else {
            return roomAOrder > roomBOrder ? 1 : -1;
          }
        }
      );
    }

    return assignmentsByDate.flat();
  }

  sortByCountAndByDistance(
    a: ParticipantDynamicInterface,
    b: ParticipantDynamicInterface
  ): number {
    if (a.count < b.count) {
      return -1;
    }
    if (a.count > b.count) {
      return 1;
    }
    if (
      new Date(a.lastAssignmentDate).getTime() -
        new Date(a.penultimateAssignmentDate).getTime() <
      new Date(b.lastAssignmentDate).getTime() -
        new Date(b.penultimateAssignmentDate).getTime()
    ) {
      return -1;
    }
    if (
      new Date(a.lastAssignmentDate).getTime() -
        new Date(a.penultimateAssignmentDate).getTime() >
      new Date(b.lastAssignmentDate).getTime() -
        new Date(b.penultimateAssignmentDate).getTime()
    ) {
      return 1;
    }
    return 0;
  }
}
