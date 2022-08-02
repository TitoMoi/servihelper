import { formatDistanceStrict, Locale } from 'date-fns';

import { ParticipantInterface } from '../participant/model/participant.model';

/**
 *
 * @param assignmentList array the list of assignments
 * @param participant object the participant
 * @returns the penultimate date or undefined
 */
export function getDistanceBetweenPenultimaAndLast(
  participantList: ParticipantInterface[],
  locale: Locale
): void {
  //Get the distance, i18n sensitive
  for (const participant of participantList) {
    if (
      participant.penultimateAssignmentDate &&
      participant.lastAssignmentDate
    ) {
      participant.distanceBetweenPenultimaAndLast = formatDistanceStrict(
        new Date(participant.penultimateAssignmentDate),
        new Date(participant.lastAssignmentDate),
        {
          locale,
        }
      );
    }
  }
}
