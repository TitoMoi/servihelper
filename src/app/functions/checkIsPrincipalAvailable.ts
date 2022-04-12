import { ParticipantInterface } from "app/participant/model/participant.model";

/**
 *
 * @param participant the participants to check if can participate
 * @param atId the id of the assign type
 * @param rId the id of the room
 */
export function checkIsPrincipalAvailable(
  participant: ParticipantInterface,
  atId,
  rId
): boolean {
  //Not available
  if (!participant.available) return false;

  let canAssignType = false;
  let canRoom = false;

  for (const at of participant.assignTypes) {
    if (at.assignTypeId === atId) {
      canAssignType = at.canPrincipal;
      break;
    }
  }
  for (const room of participant.rooms) {
    if (room.id === rId) {
      canRoom = room.available;
      break;
    }
  }
  return canAssignType && canRoom;
}
