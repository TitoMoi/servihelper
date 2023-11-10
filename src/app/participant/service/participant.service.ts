import {
  ParticipantAssignTypeInterface,
  ParticipantInterface,
  ParticipantModel,
} from "app/participant/model/participant.model";
import { writeJson, readJSONSync } from "fs-extra";
import { nanoid } from "nanoid/non-secure";

import { Injectable } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";
import { LockService } from "app/lock/service/lock.service";

@Injectable({
  providedIn: "root",
})
export class ParticipantService {
  readonly filename = "participant.json";

  //flag to indicate that participants file has changed
  hasChanged = true;
  //The array of participants in memory
  #participants: ParticipantInterface[] = undefined;
  //The map of participants for look up by id
  #participantsMap: Map<string, ParticipantInterface> = new Map();

  constructor(private configService: ConfigService, private lockService: LockService) {}

  /**
   * @param deepClone if should return the cloned array or the reference
   * @returns ParticipantInterface[] the array of participants
   */
  getParticipants(deepClone = false): ParticipantInterface[] {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#participants) : this.#participants;
    }
    this.hasChanged = false;
    this.#participants = readJSONSync(this.configService.participantsPath);
    this.updateMapOfParticipants();
    return deepClone ? structuredClone(this.#participants) : this.#participants;
  }

  updateMapOfParticipants() {
    for (const participant of this.#participants) {
      this.#participantsMap.set(participant.id, participant);
    }
  }

  getParticipantsLength() {
    return this.#participants?.length;
  }

  /**
   *
   * @returns true if participants are saved to disk or false
   */
  saveParticipantsToFile() {
    //Write participants back to file
    writeJson(this.configService.participantsPath, this.#participants);
    //Notify the lock we are working
    this.lockService.updateTimestamp();
  }

  /**
   *
   * @param participant the participant to create
   * @returns true if participant is saved false if not
   */
  createParticipant(participant: ParticipantInterface) {
    //Generate id for the participant
    participant.id = nanoid(this.configService.nanoMaxCharId);
    //Trim the name
    participant.name = participant.name.trim();
    //add participant to participants
    this.#participants.push(participant);
    this.#participantsMap.set(participant.id, participant);

    //ORDER THE PARTICIPANTS BY A to Z
    this.#participants.sort(function (a, b) {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });

    //save participants with the new participant
    this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the id of the participant to search for
   * @returns the participant that is ALWAYS found
   */
  getParticipant(id: string): ParticipantInterface {
    return this.#participantsMap.get(id);
  }

  /**
   *
   * @param participant the participant to update
   * @returns true if participant is updated and saved false otherwise
   */
  updateParticipant(participant: ParticipantInterface) {
    //update participant
    for (let i = 0; i < this.#participants.length; i++) {
      if (this.#participants[i].id === participant.id) {
        //Clean incoming participant first, maybe has dynamic data from assignments section
        const pModel = new ParticipantModel(participant);
        //Trim the name
        pModel.name = pModel.name.trim();
        //Convert class to obj
        this.#participants[i] = { ...pModel };

        this.#participantsMap.set(participant.id, participant);
        //save participants with the updated participant

        //ORDER THE PARTICIPANTS BY A to Z
        this.#participants.sort(function (a, b) {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
        break;
      }
    }
    this.saveParticipantsToFile();
  }

  /**
   *
   * @param participant the participant to delete
   * @returns true if participant is deleted and saved false otherwise
   */
  deleteParticipant(id: string) {
    //delete participant
    this.#participants = this.#participants.filter((b) => b.id !== id);
    this.#participantsMap.delete(id);
    //save participants
    this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the id of the new assignType to add
   * @returns
   */
  addAssignType(id: string, hasAssistant: boolean) {
    for (const participant of this.#participants) {
      const participantAssignTypesValue: ParticipantAssignTypeInterface = {
        assignTypeId: id,
        canPrincipal: true,
        canAssistant: hasAssistant,
      };

      participant.assignTypes = [...participant.assignTypes, participantAssignTypesValue];
      this.#participantsMap.set(participant.id, participant);
    }

    this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the id of the assignType to update
   * @returns
   */
  massiveUpdateAssignType(id: string, hasAssistant: boolean) {
    for (const participant of this.#participants) {
      const pAssignType = participant.assignTypes.find((at) => at.assignTypeId === id);

      //If we imported new assign types and for some reason on available section this participant
      //is not available, he doesnt receive a reference, so we need to update it here
      if (!pAssignType) {
        const pAtNew: ParticipantAssignTypeInterface = {
          assignTypeId: id,
          canPrincipal: true,
          canAssistant: hasAssistant,
        };
        participant.assignTypes.push(pAtNew);
      } else {
        pAssignType.canAssistant = hasAssistant;
      }
      this.#participantsMap.set(participant.id, participant);
    }

    this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the assignType id to delete for all the participants
   * @returns true if all participants are updated and saved false otherwise
   */
  deleteAssignType(id: string) {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.#participants.length; i++) {
      this.#participants[i].assignTypes = this.#participants[i].assignTypes.filter(
        (at) => at.assignTypeId !== id
      );

      this.#participantsMap.set(this.#participants[i].id, this.#participants[i]);
    }
    this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the id of the new room to add
   * @returns
   */
  addRoom(roomId: string) {
    for (const participant of this.#participants) {
      const value = {
        roomId,
        available: true,
      };

      participant.rooms = [...participant.rooms, value];
      this.#participantsMap.set(participant.id, participant);
    }

    this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the room id to delete for all the participants
   * @returns true if all participants are updated and saved false otherwise
   */
  deleteRoom(id: string) {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.#participants.length; i++) {
      this.#participants[i].rooms = this.#participants[i].rooms.filter(
        (at) => at.roomId !== id
      );

      this.#participantsMap.set(this.#participants[i].id, this.#participants[i]);
    }
    this.saveParticipantsToFile();
  }
}
