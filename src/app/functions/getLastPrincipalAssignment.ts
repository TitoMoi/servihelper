import isAfter from "date-fns/isAfter";

import { AssignmentInterface } from "../assignment/model/assignment.model";
import { ParticipantInterface } from "../participant/model/participant.model";

/**
 *
 * @param assignmentList array of assignments
 * @param participant object the principal participant
 * @returns the last assignment or undefined
 */
export function getLastPrincipalAssignment(
  assignmentList: AssignmentInterface[],
  participant: ParticipantInterface
): AssignmentInterface | undefined {
  const firstAssignment = assignmentList
    .filter((assignment) => assignment.principal === participant.id)
    .sort(compareFn)[0]; //Get first value

  return firstAssignment ? firstAssignment : undefined;
}

function compareFn(a: AssignmentInterface, b: AssignmentInterface) {
  const isAfterRes = isAfter(new Date(a.date), new Date(b.date));
  return isAfterRes ? -1 : 1;
}
