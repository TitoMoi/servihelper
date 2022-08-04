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
  async filterPrincipalsByAvailable(
    principals: ParticipantInterface[],
    dateTimeValue,
    assignTypeId,
    roomId,
    onlyMan,
    onlyWoman
  ): Promise<ParticipantInterface[]> {
    return new Promise((resolve, reject) => {
      principals = principals.filter((p) =>
        p.available &&
        p.assignTypes.some(
          (at) => at.assignTypeId === assignTypeId && at.canPrincipal
        ) &&
        p.rooms.some((r) => r.roomId === roomId && r.available) &&
        !p.notAvailableDates.some(
          (date) => dateTimeValue === new Date(date).getTime()
        ) &&
        onlyMan
          ? p.isWoman === false
          : true && onlyWoman
          ? p.isWoman === true
          : true
      );
      resolve(principals);
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
  async filterAssistantsByAvailable(
    assistants: ParticipantInterface[],
    dateTimeValue,
    assignTypeId,
    roomId,
    onlyMan,
    onlyWoman
  ): Promise<ParticipantInterface[]> {
    return new Promise((resolve, reject) => {
      assistants = assistants.filter((a) =>
        a.available &&
        a.assignTypes.some(
          (at) => at.assignTypeId === assignTypeId && at.canAssistant
        ) &&
        a.rooms.some((r) => r.roomId === roomId && r.available) &&
        !a.notAvailableDates.some(
          (date) => dateTimeValue === new Date(date).getTime()
        ) &&
        onlyMan
          ? a.isWoman === false
          : true && onlyWoman
          ? a.isWoman === true
          : true
      );
      resolve(assistants);
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
