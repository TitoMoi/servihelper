import { ParticipantInterface } from "app/participant/model/participant.model";

/**
 * @param list the list to filter only men
 * @returns the new filtered list
 */
export function setListToOnlyMen(
  list: ParticipantInterface[]
): ParticipantInterface[] {
  return list.filter((b) => b.isWoman === false);
}
