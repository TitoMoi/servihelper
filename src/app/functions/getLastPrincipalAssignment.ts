import { isAfter } from "date-fns";

import { AssignmentInterface } from "../assignment/model/assignment.model";
import { ParticipantInterface } from "../participant/model/participant.model";

/**
 *
 * @param assignmentList array of assignments
 * @param participant object the principal participant
 * @param assignTypeId the id of the assignType to be more specific
 * @returns the last assignment or undefined
 */
export function getLastPrincipalAssignment(
  assignmentList: AssignmentInterface[],
  participant: ParticipantInterface,
  assignTypeIdList?: string[],
): AssignmentInterface | undefined {
  const firstAssignment = assignmentList
    .filter((assignment) =>
      assignTypeIdList
        ? assignment.principal === participant.id &&
          assignTypeIdList.includes(assignment.assignType)
        : assignment.principal === participant.id,
    )
    .sort(compareFn)[0]; //Get first value

  return firstAssignment ? firstAssignment : undefined;
}

function compareFn(a: AssignmentInterface, b: AssignmentInterface) {
  const isAfterRes = isAfter(new Date(a.date), new Date(b.date));
  return isAfterRes ? -1 : 1;
}
