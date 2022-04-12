import { ParticipantInterface } from "app/participant/model/participant.model";

/**
 *
 * @param participantList
 * @returns ParticipantInterface[] participants that are onlyAssistant
 */
export function filterOnlyAssistant(
  participantList: ParticipantInterface[]
): ParticipantInterface[] {
  return participantList.filter(
    (b: ParticipantInterface) => b.onlyAssistant !== true
  );
}
