/* eslint-disable complexity */
import {
  ParticipantDynamicInterface,
  ParticipantInterface,
} from "app/participant/model/participant.model";

import { Injectable } from "@angular/core";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { ParticipantService } from "app/participant/service/participant.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ipcRenderer } from "electron";
import { Locale, formatDistanceStrict } from "date-fns";
import { TranslocoService } from "@ngneat/transloco";
const { version } = require("../../../package.json");

@Injectable({
  providedIn: "root",
})
export class SharedService {
  appVersion = version;

  constructor(
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private translocoService: TranslocoService,
  ) {}

  /**
   *
   * @param participants the array of participants
   * @param dateTimeValue the dateTime value from the selected form date in milliseconds
   * @param assignTypeId the id of the assignType to participate
   * @param roomId the id of the room to participate
   * @returns A new array of participants that meet the criteria
   *
   * The participant must be global available, able to participate in the room and assigntype selected
   * and be available in the selected date
   */
  filterPrincipalsByAvailable(
    principals: ParticipantInterface[],
    assignTypeId,
    roomId,
    onlyMan,
    onlyWoman,
  ): ParticipantInterface[] {
    return principals.filter((p) => {
      const isAvailable = p.available;
      const canAssignType = p.assignTypes.some(
        (at) => at.assignTypeId === assignTypeId && at.canPrincipal,
      );
      const canRoom = p.rooms.some((r) => r.roomId === roomId && r.available);
      const canOnlyMan = onlyMan ? p.isWoman === false : true;
      const canOnlyWoman = onlyWoman ? p.isWoman === true : true;

      return isAvailable && canAssignType && canRoom && canOnlyMan && canOnlyWoman;
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
    assignTypeId,
    roomId,
    onlyMan,
    onlyWoman,
  ): ParticipantInterface[] {
    return assistants.filter((p) => {
      const isAvailable = p.available;
      const canAssignType = p.assignTypes.some(
        (at) => at.assignTypeId === assignTypeId && at.canAssistant,
      );
      const canRoom = p.rooms.some((r) => r.roomId === roomId && r.available);
      const canOnlyMan = onlyMan ? p.isWoman === false : true;
      const canOnlyWoman = onlyWoman ? p.isWoman === true : true;

      return isAvailable && canAssignType && canRoom && canOnlyMan && canOnlyWoman;
    });
  }

  /**
   *
   * @param assignmentList array the list of assignments
   * @param participantList array the list of the participants
   * @param roomId string the id of the selected room
   * @param assignTypeId string the id of the selected assignType
   * @param isPrincipal boolean if is principal or assistant
   */
  setCountAndLastAssignmentDateAndRoom(
    assignmentList: AssignmentInterface[],
    participantList: ParticipantDynamicInterface[],
    assignTypeId: string,
    isPrincipal: boolean,
  ): void {
    //set "count" to 0
    for (const p of participantList) {
      p.count = 0;
    }

    //Apply count
    for (const assignment of assignmentList) {
      //match the assignType
      if (assignment.assignType === assignTypeId) {
        //not expensive, not many participants, maybe 200 in a kingdom hall?
        for (const participant of participantList) {
          if (participant.id === (isPrincipal ? assignment.principal : assignment.assistant)) {
            //Add +1 for every matching room and assignType to the participants count
            participant.count += 1;
            //Add the date of the last assignment
            if (!participant.lastAssignmentDate) {
              participant.lastAssignmentDate = assignment.date;
              participant.lastAssignmentRoom = assignment.room;
            } else if (new Date(participant.lastAssignmentDate) < new Date(assignment.date)) {
              participant.lastAssignmentDate = assignment.date;
              participant.lastAssignmentRoom = assignment.room;
            }
            break;
          }
        }
      }
    }
  }

  /** Needs user interaction because the name can be already taken */
  getFilename(assignment: AssignmentInterface): string {
    const filename =
      this.participantService.getParticipant(assignment.principal).name +
      "-" +
      this.assignTypeService.getNameOrTranslation(
        this.assignTypeService.getAssignType(assignment.assignType),
      );
    return filename;
  }

  saveUInt8ArrayAsPdfFile(uint8Array: Uint8Array, filename: string) {
    const blob = new Blob([uint8Array], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    link.remove();
  }

  saveBlobAsPdfFile(blob: Blob, filename: string) {
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    link.remove();
  }

  getDistanceBetweenPenultimaAndLast(
    participantList: ParticipantDynamicInterface[],
    locale: Locale,
    lastSelectedDate?: Date,
  ): void {
    //Get the distance, i18n sensitive
    for (const participant of participantList) {
      //This means that the distance must be from last to today
      if (lastSelectedDate && participant.lastAssignmentDate) {
        participant.distanceBetweenPenultimaAndLast = formatDistanceStrict(
          new Date(participant.lastAssignmentDate),
          lastSelectedDate,
          {
            locale,
          },
        );
      }
      if (
        participant.penultimateAssignmentDate &&
        participant.lastAssignmentDate &&
        !lastSelectedDate
      ) {
        participant.distanceBetweenPenultimaAndLast = formatDistanceStrict(
          new Date(participant.penultimateAssignmentDate),
          new Date(participant.lastAssignmentDate),
          {
            locale,
          },
        );
      }
      if (!participant.distanceBetweenPenultimaAndLast)
        participant.distanceBetweenPenultimaAndLast =
          this.translocoService.translate("SORT_NO_DISTANCE");
    }
  }

  closeApp() {
    ipcRenderer.send("closeApp");
  }
}
