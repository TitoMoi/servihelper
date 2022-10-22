import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { ParticipantDynamicInterface } from "app/participant/model/participant.model";

/**
 *
 * @param assignmentList array the list of assignments
 * @param participantList array the list of the participants
 */
export function setPrincipalCountById(
  assignmentList: AssignmentInterface[],
  participantList: ParticipantDynamicInterface[]
): void {
  //reset "count" to 0
  participantList.forEach((participant) => (participant.count = 0));

  //Apply count
  for (const assignment of assignmentList) {
    //not expensive, not many participants, maybe 200 in a kingdom hall?
    for (const participant of participantList) {
      if (participant.id === assignment.principal) {
        //Add +1 for every matching id to the participants count
        participant.count += 1;
        break;
      }
    }
  }
}
