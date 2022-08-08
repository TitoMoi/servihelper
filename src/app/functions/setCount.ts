import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { ParticipantInterface } from "app/participant/model/participant.model";

/**
 *
 * @param assignmentList array the list of assignments
 * @param participantList array the list of the participants
 * @param roomId string the id of the selected room
 * @param assignTypeId string the id of the selected assignType
 * @param isPrincipal boolean if is principal or assistant
 */
export function setCount(
  assignmentList: AssignmentInterface[],
  participantList: ParticipantInterface[],
  roomId: string,
  assignTypeId: string,
  isPrincipal: boolean
): void {
  //set "count" to 0
  for (const p of participantList) {
    p.count = 0;
  }

  //Aply count
  for (const assignment of assignmentList) {
    //match the room and the assignType
    if (assignment.assignType === assignTypeId && assignment.room === roomId) {
      //not expensive, not many participants, maybe 200 in a kingdom hall?
      for (const participant of participantList) {
        if (
          participant.id ===
          (isPrincipal ? assignment.principal : assignment.assistant)
        ) {
          //Add +1 for every matching room and assignType to the participants count
          participant.count += 1;
          break;
        }
      }
    }
  }
}
