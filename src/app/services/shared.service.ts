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
   * @param dateTimeValue the dateTime value from the selected form date
   * @param assignTypeId the id of the assignType to participate
   * @param roomId the id of the room to participate
   * @returns A new array of participants that meet the criteria
   *
   * The participant must be global available, able to participate in the room and assigntype selected
   * and be available in the selected date
   */
  filterPrincipalsByAvailable(
    principals: ParticipantInterface[],
    dateTimeValue,
    assignTypeId,
    roomId,
    onlyMan,
    onlyWoman
  ): ParticipantInterface[] {
    return principals.filter((p) => {
      const isAvailable = p.available;
      const canAssignType = p.assignTypes.some(
        (at) => at.assignTypeId === assignTypeId && at.canPrincipal
      );
      const canRoom = p.rooms.some((r) => r.roomId === roomId && r.available);
      const canDate = !p.notAvailableDates.some(
        (date) => dateTimeValue === new Date(date).getTime()
      );
      const canOnlyMan = onlyMan ? p.isWoman === false : true;
      const canOnlyWoman = onlyWoman ? p.isWoman === true : true;

      return (
        isAvailable &&
        canAssignType &&
        canRoom &&
        canDate &&
        canOnlyMan &&
        canOnlyWoman
      );
    });
  }

  /**
   *
   * @param participants the array of participants
   * @param dateTimeValue the dateTime value from the selected form date
   * @param assignTypeId the id of the assignType to participate
   * @param roomId the id of the room to participate
   * @returns A new array of participants that meet the criteria
   *
   * The participant must be global available, able to participate in the room and assigntype selected
   * and be available in the selected date
   */
  filterAssistantsByAvailable(
    assistants: ParticipantInterface[],
    dateTimeValue,
    assignTypeId,
    roomId,
    onlyMan,
    onlyWoman
  ): ParticipantInterface[] {
    return assistants.filter((p) => {
      const isAvailable = p.available;
      const canAssignType = p.assignTypes.some(
        (at) => at.assignTypeId === assignTypeId && at.canAssistant
      );
      const canRoom = p.rooms.some((r) => r.roomId === roomId && r.available);
      const canDate = !p.notAvailableDates.some(
        (date) => dateTimeValue === new Date(date).getTime()
      );
      const canOnlyMan = onlyMan ? p.isWoman === false : true;
      const canOnlyWoman = onlyWoman ? p.isWoman === true : true;

      return (
        isAvailable &&
        canAssignType &&
        canRoom &&
        canDate &&
        canOnlyMan &&
        canOnlyWoman
      );
    });
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
