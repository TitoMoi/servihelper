import { ParticipantInterface } from 'app/participant/model/participant.model';

/**
 * @param list the list to filter only women
 * @returns the new filtered list
 */
export function setListToOnlyWomen(list: ParticipantInterface[]): ParticipantInterface[] {
  return list.filter(b => b.isWoman === true);
}
