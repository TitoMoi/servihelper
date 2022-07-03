import { Injectable } from "@angular/core";
import { ParticipantInterface } from "app/participant/model/participant.model";

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

    principals = principals.filter((p) => p.available);

    principals = principals.filter((p) =>
      p.assignTypes.some(
        (at) => at.assignTypeId === assignTypeId && at.canPrincipal
      )
    );

    principals = principals.filter((p) =>
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

    for (let principal of assistants) {
      assistants = assistants.filter((p) => principal.available);

      assistants = assistants.filter((p) =>
        p.assignTypes.some(
          (at) => at.assignTypeId === assignTypeId && at.canAssistant
        )
      );

      assistants = assistants.filter((p) =>
        p.rooms.some((r) => r.roomId === roomId && r.available)
      );
    }

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
