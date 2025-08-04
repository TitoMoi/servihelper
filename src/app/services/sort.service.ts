import {
  AssignmentInterface,
  AssignmentTableInterface
} from 'app/assignment/model/assignment.model';
import { AssignTypeService } from 'app/assigntype/service/assigntype.service';
import { RoomService } from 'app/room/service/room.service';

import { inject, Injectable } from '@angular/core';
import { AssignmentService } from 'app/assignment/service/assignment.service';
import { TerritoryContextInterface } from 'app/map/model/map.model';
import { ParticipantDynamicInterface } from 'app/participant/model/participant.model';

export type SortOrderType = 'Asc' | 'Desc';
@Injectable({
  providedIn: 'root'
})
export class SortService {
  private assignTypeService = inject(AssignTypeService);
  private assignmentService = inject(AssignmentService);
  private roomService = inject(RoomService);

  /**
   *
   * @param assignments a paginated assignments result, not all the assignments
   * @returns
   */
  sortAssignmentsByDateThenRoomAndAssignType(
    assignments: AssignmentTableInterface[] | AssignmentInterface[],
    order: SortOrderType
  ) {
    //Sort by date first
    assignments.sort(
      order === 'Desc'
        ? this.assignmentService.sortAssignmentsByDateDesc
        : this.assignmentService.sortAssignmentsByDateAsc
    );

    //Diferent sort, first separate date into arrays, then double sort, first room and then assign type
    const assignmentsByDate = [[]];
    let index = 0;
    let lastDate = assignments[0]?.date;

    for (const assignment of assignments) {
      if (new Date(assignment.date).getTime() === new Date(lastDate).getTime()) {
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
        (a: AssignmentTableInterface, b: AssignmentTableInterface) => {
          const assignTypeAOrder = this.assignTypeService.getAssignType(a.assignType).order;
          const assignTypeBOrder = this.assignTypeService.getAssignType(b.assignType).order;
          const roomAOrder = this.roomService.getRoom(a.room).order;
          const roomBOrder = this.roomService.getRoom(b.room).order;

          if (roomAOrder === roomBOrder) {
            if (assignTypeAOrder === assignTypeBOrder) {
              return 0;
            }
            return assignTypeAOrder > assignTypeBOrder ? 1 : -1;
          } else {
            return roomAOrder > roomBOrder ? 1 : -1;
          }
        }
      );
    }

    return assignmentsByDate.flat();
  }

  sortDates(a: Date, b: Date): number {
    const dateA = new Date(a);
    const dateB = new Date(b);
    if (dateA > dateB) {
      return 1;
    }
    if (dateA < dateB) {
      return -1;
    }
    return 0;
  }

  sortByIsManAndByName(a: ParticipantDynamicInterface, b: ParticipantDynamicInterface) {
    if (a.isWoman && !b.isWoman) {
      return 1;
    }
    if (!a.isWoman && b.isWoman) {
      return -1;
    }
    if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    }
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    }
    return 0;
  }

  sortByIsWomanAndByName(a: ParticipantDynamicInterface, b: ParticipantDynamicInterface) {
    if (a.isWoman && !b.isWoman) {
      return -1;
    }
    if (!a.isWoman && b.isWoman) {
      return 1;
    }
    if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    }
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    }
    return 0;
  }

  sortByCount(a: number, b: number) {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }

  sortByCountAndByDistance(a: ParticipantDynamicInterface, b: ParticipantDynamicInterface): number {
    if (a.count < b.count) {
      return -1;
    }
    if (a.count > b.count) {
      return 1;
    }
    if (
      new Date(a.lastAssignmentDate).getTime() - new Date(a.penultimateAssignmentDate).getTime() <
      new Date(b.lastAssignmentDate).getTime() - new Date(b.penultimateAssignmentDate).getTime()
    ) {
      return -1;
    }
    if (
      new Date(a.lastAssignmentDate).getTime() - new Date(a.penultimateAssignmentDate).getTime() >
      new Date(b.lastAssignmentDate).getTime() - new Date(b.penultimateAssignmentDate).getTime()
    ) {
      return 1;
    }
    return 0;
  }

  sortParticipantsByGender(a: ParticipantDynamicInterface, b: ParticipantDynamicInterface) {
    // false values first
    return a.isWoman === b.isWoman ? 0 : a.isWoman ? 1 : -1;
  }

  sortParticipantsByName(a: ParticipantDynamicInterface, b: ParticipantDynamicInterface) {
    if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    }
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    }
    return 0;
  }

  sortParticipantsByCount(a: ParticipantDynamicInterface, b: ParticipantDynamicInterface) {
    if (a.count < b.count) {
      return -1;
    }
    if (a.count > b.count) {
      return 1;
    }
    return 0;
  }

  sortParticipantsByCountOrDate(
    a: ParticipantDynamicInterface,
    b: ParticipantDynamicInterface
  ): number {
    if (a.count < b.count) {
      return -1;
    }
    if (a.count > b.count) {
      return 1;
    }

    if (new Date(a.lastAssignmentDate) < new Date(b.lastAssignmentDate)) {
      return -1;
    }

    if (new Date(a.lastAssignmentDate) > new Date(b.lastAssignmentDate)) {
      return 1;
    }
    return 0;
  }

  sortTerritoriesByLastWorked(a: TerritoryContextInterface, b: TerritoryContextInterface) {
    const timeDateA = new Date(a.returnedDates.at(-1))?.getTime();
    const timeDateB = new Date(b.returnedDates.at(-1))?.getTime();
    return timeDateA - timeDateB;
  }
}
