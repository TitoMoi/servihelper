import { ParticipantInterface } from "app/participant/model/participant.model";

export function sortParticipantsByCount(
  a: ParticipantInterface,
  b: ParticipantInterface
): number {
  if (a.count < b.count) {
    return -1;
  }
  if (a.count > b.count) {
    return 1;
  }
  return 0;
}
