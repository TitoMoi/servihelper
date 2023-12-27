import { isAfter } from "date-fns";

import { AssignmentInterface } from "../assignment/model/assignment.model";
import { ParticipantInterface } from "../participant/model/participant.model";

/**
 *
 * @param assignmentList array the list of assignments
 * @param participant object the participant
 * @returns the penultimate assignment or undefined
 */
export function getPenultimateAssignment(
  assignmentList: AssignmentInterface[],
  participant: ParticipantInterface
): AssignmentInterface | undefined {
  const firstAssignment = assignmentList
    .filter(
      (assignment) =>
        assignment.principal === participant.id || assignment.assistant === participant.id
    )
    .sort(compareFn)[1]; //Get penultimate

  return firstAssignment ? firstAssignment : undefined;
}

function compareFn(a: AssignmentInterface, b: AssignmentInterface) {
  const isAfterRes = isAfter(new Date(a.date), new Date(b.date));
  return isAfterRes ? -1 : 1;
}
