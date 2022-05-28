import { Injectable } from "@angular/core";
import { APP_CONFIG } from "environments/environment";
import {
  ParticipantAssignTypesInterface,
  ParticipantInterface,
} from "app/participant/model/participant.model";
import * as fs from "fs-extra";
import { ElectronService } from "app/services/electron.service";
import { nanoid } from "nanoid/non-secure";

@Injectable({
  providedIn: "root",
})
export class ParticipantService {
  //fs-extra api
  fs: typeof fs = this.electronService.remote.require("fs-extra");
  //where the file is depending on the context
  path: string = APP_CONFIG.production
    ? //__dirname is where the .js file exists
      __dirname + "/assets/source/participant.json"
    : "./assets/source/participant.json";

  //The array of participants in memory
  #participants: ParticipantInterface[] = undefined;
  //flag to indicate that participants file has changed
  hasChanged: boolean = true;

  constructor(private electronService: ElectronService) {}

  /**
   * @param deepClone if should return the cloned array or the reference
   * @returns ParticipantInterface[] the array of participants
   */
  getParticipants(deepClone = false): ParticipantInterface[] {
    if (!this.hasChanged) {
      return deepClone
        ? structuredClone(this.#participants)
        : this.#participants;
    }
    this.hasChanged = false;
    this.#participants = this.fs.readJSONSync(this.path);
    return deepClone ? structuredClone(this.#participants) : this.#participants;
  }

  /**
   *
   * @returns true if participants are saved to disk or false
   */
  saveParticipantsToFile(): boolean {
    try {
      //Write participants back to file
      this.fs.writeJson(this.path, this.#participants);
      //Flag
      this.hasChanged = true;
      return true;
    } catch (err) {
      console.error("saveParticipants", err);
      return false;
    }
  }

  /**
   *
   * @param participant the participant to create
   * @returns true if participant is saved false if not
   */
  createParticipant(participant: ParticipantInterface): boolean {
    //Generate id for the participant
    participant.id = nanoid();
    //add participant to participants
    this.#participants.push(participant);

    //ORDER THE PARTICIPANTS BY A to Z
    this.#participants = this.#participants.sort(function (a, b) {
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
    //Preventive maybe this func is called outside participants view
    this.checkParticipants();
    //search participant
    for (const participant of this.#participants) {
      if (participant.id === id) {
        return participant;
      }
    }
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
        this.#participants[i] = participant;
        //save participants with the updated participant
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
    //save participants
    return this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the id of the new assignType to add
   * @returns
   */
  addAssignType(id: string): boolean {
    //Preventive maybe this func is called outside participants view
    this.checkParticipants();

    const participantAssignTypesValue: ParticipantAssignTypesInterface = {
      assignTypeId: id,
      canPrincipal: true,
      canAssistant: true,
    };

    for (const participant of this.#participants) {
      participant.assignTypes = [
        ...participant.assignTypes,
        participantAssignTypesValue,
      ];
    }

    return this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the assignType id to delete for all the participants
   * @returns true if all participants are updated and saved false otherwise
   */
  deleteAssignType(id: string): boolean {
    //Preventive maybe this func is called outside participants view
    this.checkParticipants();
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.#participants.length; i++) {
      this.#participants[i].assignTypes = this.#participants[
        i
      ].assignTypes.filter((at) => at.assignTypeId !== id);
    }
    return this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the id of the new room to add
   * @returns
   */
  addRoom(roomId: string): boolean {
    //Preventive maybe this func is called outside participants view
    this.checkParticipants();

    const value = {
      roomId,
      available: true,
    };

    for (const participant of this.#participants) {
      participant.rooms = [...participant.rooms, value];
    }

    return this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the room id to delete for all the participants
   * @returns true if all participants are updated and saved false otherwise
   */
  deleteRoom(id: string): boolean {
    //Preventive maybe this func is called outside participants view
    this.checkParticipants();
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.#participants.length; i++) {
      this.#participants[i].rooms = this.#participants[i].rooms.filter(
        (at) => at.roomId !== id
      );
    }
    return this.saveParticipantsToFile();
  }

  checkParticipants() {
    if (!this.#participants.length) {
      this.getParticipants();
    }
  }
}
