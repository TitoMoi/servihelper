import {
  ParticipantAssignTypeInterface,
  ParticipantInterface,
  ParticipantModel,
} from "app/participant/model/participant.model";
import { writeJson, readJSONSync } from "fs-extra";
import { nanoid } from "nanoid/non-secure";

import { Injectable } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";

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

  constructor(private configService: ConfigService) {}

  getFileName() {
    return "participant.json";
  }

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
    for (const participant of this.#participants) {
      this.#participantsMap.set(participant.id, participant);
    }
    return deepClone ? structuredClone(this.#participants) : this.#participants;
  }

  getParticipantsLength() {
    return this.#participants?.length;
  }

  /**
   *
   * @returns true if participants are saved to disk or false
   */
  saveParticipantsToFile(): boolean {
    //Write participants back to file
    writeJson(this.configService.participantsPath, this.#participants);
    return true;
  }

  /**
   *
   * @param participant the participant to create
   * @returns true if participant is saved false if not
   */
  createParticipant(participant: ParticipantInterface): boolean {
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
    return this.saveParticipantsToFile();
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
  updateParticipant(participant: ParticipantInterface): boolean {
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

        return this.saveParticipantsToFile();
      }
    }
    return false;
  }

  /**
   *
   * @param participant the participant to delete
   * @returns true if participant is deleted and saved false otherwise
   */
  deleteParticipant(id: string): boolean {
    //delete participant
    this.#participants = this.#participants.filter((b) => b.id !== id);
    this.#participantsMap.delete(id);
    //save participants
    return this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the id of the new assignType to add
   * @returns
   */
  addAssignType(id: string, hasAssistant: boolean): boolean {
    const participantAssignTypesValue: ParticipantAssignTypeInterface = {
      assignTypeId: id,
      canPrincipal: true,
      canAssistant: hasAssistant,
    };

    for (const participant of this.#participants) {
      participant.assignTypes = [...participant.assignTypes, participantAssignTypesValue];
      this.#participantsMap.set(participant.id, participant);
    }

    return this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the assignType id to delete for all the participants
   * @returns true if all participants are updated and saved false otherwise
   */
  deleteAssignType(id: string): boolean {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.#participants.length; i++) {
      this.#participants[i].assignTypes = this.#participants[i].assignTypes.filter(
        (at) => at.assignTypeId !== id
      );

      this.#participantsMap.set(this.#participants[i].id, this.#participants[i]);
    }
    return this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the id of the new room to add
   * @returns
   */
  addRoom(roomId: string): boolean {
    const value = {
      roomId,
      available: true,
    };

    for (const participant of this.#participants) {
      participant.rooms = [...participant.rooms, value];
      this.#participantsMap.set(participant.id, participant);
    }

    return this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the room id to delete for all the participants
   * @returns true if all participants are updated and saved false otherwise
   */
  deleteRoom(id: string): boolean {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.#participants.length; i++) {
      this.#participants[i].rooms = this.#participants[i].rooms.filter(
        (at) => at.roomId !== id
      );

      this.#participantsMap.set(this.#participants[i].id, this.#participants[i]);
    }
    return this.saveParticipantsToFile();
  }
}
