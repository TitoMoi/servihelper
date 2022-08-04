import { ParticipantInterface } from "app/participant/model/participant.model";

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SharedService {
  constructor() {}

  /**
   *
   * @param participants the array of participants
   * @param assignTypeId the id of the assignType to participate
   * @param roomId the id of the room to participate
   * @returns A new array of participants that meet the criteria
   */
  filterPrincipalsByAvailable(
    participants: ParticipantInterface[],
    assignTypeId,
    roomId
  ): ParticipantInterface[] {
    let principals = structuredClone(participants);

    principals = principals.filter(
      (p) =>
        p.available &&
        p.assignTypes.some(
          (at) => at.assignTypeId === assignTypeId && at.canPrincipal
        ) &&
        p.rooms.some((r) => r.roomId === roomId && r.available)
    );

    return principals;
  }

  /**
   *
   * @param participants the array of participants
   * @param assignTypeId the id of the assignType to participate
   * @param roomId the id of the room to participate
   * @returns A new array of participants that meet the criteria
   */
  filterAssistantsByAvailable(
    participants: ParticipantInterface[],
    assignTypeId,
    roomId
  ): ParticipantInterface[] {
    let assistants = structuredClone(participants);
    assistants = assistants.filter(
      (a) =>
        a.available &&
        a.assignTypes.some(
          (at) => at.assignTypeId === assignTypeId && at.canAssistant
        ) &&
        a.rooms.some((r) => r.roomId === roomId && r.available)
    );

    return assistants;
  }

  sortDates(a: string, b: string): number {
    const dateA = new Date(a);
    const dateB = new Date(b);
    if (dateA > dateB) {
      return 1;
    }
    if (dateA < dateB) {
      return -1;
    }
    return 0;
  }
}
