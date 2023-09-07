import {
  ParticipantDynamicInterface,
  ParticipantInterface,
} from "app/participant/model/participant.model";

import { Injectable } from "@angular/core";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
/* import { version } from '../../../package.json'; */
const { version } = require("../../../package.json");

@Injectable({
  providedIn: "root",
})
export class SharedService {
  appVersion = version;

  constructor() {}

  /**
   *
   * @param participants the array of participants
   * @param dateTimeValue the dateTime value from the selected form date in milliseconds
   * @param assignTypeId the id of the assignType to participate
   * @param roomId the id of the room to participate
   * @returns A new array of participants that meet the criteria
   *
   * The participant must be global available, able to participate in the room and assigntype selected
   * and be available in the selected date
   */
  filterPrincipalsByAvailable(
    principals: ParticipantInterface[],
    assignTypeId,
    roomId,
    onlyMan,
    onlyWoman
  ): ParticipantInterface[] {
    return principals.filter((p) => {
      const isAvailable = p.available;
      const canAssignType = p.assignTypes.some(
        (at) => at.assignTypeId === assignTypeId && at.canPrincipal
      );
      const canRoom = p.rooms.some((r) => r.roomId === roomId && r.available);
      const canOnlyMan = onlyMan ? p.isWoman === false : true;
      const canOnlyWoman = onlyWoman ? p.isWoman === true : true;

      return isAvailable && canAssignType && canRoom && canOnlyMan && canOnlyWoman;
    });
  }

  /**
   *
   * @param participants the array of participants
   * @param dateTimeValue the dateTime value from the selected form date
   * @param assignTypeId the id of the assignType to participate
   * @param roomId the id of the room to participate
   * @returns A new array of participants that meet the criteria
   *
   * The participant must be global available, able to participate in the room and assigntype selected
   * and be available in the selected date
   */
  filterAssistantsByAvailable(
    assistants: ParticipantInterface[],
    assignTypeId,
    roomId,
    onlyMan,
    onlyWoman
  ): ParticipantInterface[] {
    return assistants.filter((p) => {
      const isAvailable = p.available;
      const canAssignType = p.assignTypes.some(
        (at) => at.assignTypeId === assignTypeId && at.canAssistant
      );
      const canRoom = p.rooms.some((r) => r.roomId === roomId && r.available);
      const canOnlyMan = onlyMan ? p.isWoman === false : true;
      const canOnlyWoman = onlyWoman ? p.isWoman === true : true;

      return isAvailable && canAssignType && canRoom && canOnlyMan && canOnlyWoman;
    });
  }

  /**
   *
   * @param assignmentList array the list of assignments
   * @param participantList array the list of the participants
   * @param roomId string the id of the selected room
   * @param assignTypeId string the id of the selected assignType
   * @param isPrincipal boolean if is principal or assistant
   */
  setCountAndLastAssignmentDateAndRoom(
    assignmentList: AssignmentInterface[],
    participantList: ParticipantDynamicInterface[],
    roomId: string,
    assignTypeId: string,
    isPrincipal: boolean
  ): void {
    //set "count" to 0
    for (const p of participantList) {
      p.count = 0;
    }

    //Apply count
    for (const assignment of assignmentList) {
      //match the assignType
      if (assignment.assignType === assignTypeId) {
        //not expensive, not many participants, maybe 200 in a kingdom hall?
        for (const participant of participantList) {
          if (participant.id === (isPrincipal ? assignment.principal : assignment.assistant)) {
            //Add +1 for every matching room and assignType to the participants count
            participant.count += 1;
            //Add the date of the last assignment
            if (!participant.lastAssignmentDate) {
              participant.lastAssignmentDate = assignment.date;
              participant.lastAssignmentRoom = assignment.room;
            } else if (new Date(participant.lastAssignmentDate) < new Date(assignment.date)) {
              participant.lastAssignmentDate = assignment.date;
              participant.lastAssignmentRoom = assignment.room;
            }
            break;
          }
        }
      }
    }
  }
}
