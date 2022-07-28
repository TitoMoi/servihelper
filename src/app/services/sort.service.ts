import { Injectable } from "@angular/core";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { RoomService } from "app/room/service/room.service";

@Injectable({
  providedIn: "root",
})
export class SortService {
  constructor(
    private assignTypeService: AssignTypeService,
    private roomService: RoomService
  ) {}

  sortAssignmentsByRoomAndAssignType(assignments: AssignmentInterface[]) {
    //Diferent sort, first separate date into arrays, then double sort, first room and then assign type
    const assignmentsByDate: [AssignmentInterface[]] = [[]];
    let index = 0;
    let lastDate = assignments[0]?.date;

    assignments.forEach((assignment) => {
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
    });

    assignmentsByDate.forEach((assignGroupByDate: AssignmentInterface[]) => {
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
    });

    return assignmentsByDate.flat();
  }
}
