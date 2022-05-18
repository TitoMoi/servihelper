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
  path: string;

  //The array of participants in memory
  #participants: ParticipantInterface[] = undefined;
  //flag to indicate that participants file has changed
  hasChanged: boolean = true;

  constructor(private electronService: ElectronService) {
    this.path = APP_CONFIG.production
      ? //__dirname is where the .js file exists
        __dirname + "./assets/source/participant.json"
      : "./assets/source/participant.json";
  }

  /**
   *
   * @returns ParticipantInterface[] the array of participants
   */
  getParticipants(): ParticipantInterface[] {
    if (!this.hasChanged) {
      return this.#participants;
    }
    this.hasChanged = false;
    this.#participants = this.fs.readJSONSync(this.path);
    return this.#participants;
  }

  /**
   *
   * @returns true if participants are saved to disk or false
   */
  async saveParticipantsToFile(): Promise<boolean> {
    try {
      //Write participants back to file
      await this.fs.writeJson(this.path, this.#participants);
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
  async createParticipant(participant: ParticipantInterface): Promise<boolean> {
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
    return await this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the id of the participant to search for
   * @returns the participant that is ALWAYS found
   */
  async getParticipant(id: string): Promise<ParticipantInterface> {
    //Preventive maybe this func is called outside participants view
    await this.checkParticipants();
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
  async updateParticipant(participant: ParticipantInterface): Promise<boolean> {
    //update participant
    for (let i = 0; i < this.#participants.length; i++) {
      if (this.#participants[i].id === participant.id) {
        this.#participants[i] = participant;
        //save participants with the updated participant
        return await this.saveParticipantsToFile();
      }
    }
    return false;
  }

  /**
   *
   * @param participant the participant to delete
   * @returns true if participant is deleted and saved false otherwise
   */
  async deleteParticipant(id: string): Promise<boolean> {
    //delete participant
    this.#participants = this.#participants.filter((b) => b.id !== id);
    //save participants
    return await this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the id of the new assignType to add
   * @returns
   */
  async addAssignType(id: string): Promise<boolean> {
    //Preventive maybe this func is called outside participants view
    await this.checkParticipants();

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

    return await this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the assignType id to delete for all the participants
   * @returns true if all participants are updated and saved false otherwise
   */
  async deleteAssignType(id: string): Promise<boolean> {
    //Preventive maybe this func is called outside participants view
    await this.checkParticipants();
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.#participants.length; i++) {
      this.#participants[i].assignTypes = this.#participants[
        i
      ].assignTypes.filter((at) => at.assignTypeId !== id);
    }
    return await this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the id of the new room to add
   * @returns
   */
  async addRoom(id: string): Promise<boolean> {
    //Preventive maybe this func is called outside participants view
    await this.checkParticipants();

    const value = {
      id,
      available: true,
    };

    for (const participant of this.#participants) {
      participant.rooms = [...participant.rooms, value];
    }

    return await this.saveParticipantsToFile();
  }

  /**
   *
   * @param id the room id to delete for all the participants
   * @returns true if all participants are updated and saved false otherwise
   */
  async deleteRoom(id: string): Promise<boolean> {
    //Preventive maybe this func is called outside participants view
    await this.checkParticipants();
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.#participants.length; i++) {
      this.#participants[i].rooms = this.#participants[i].rooms.filter(
        (at) => at.id !== id
      );
    }
    return await this.saveParticipantsToFile();
  }

  async checkParticipants() {
    if (!this.#participants.length) {
      await this.getParticipants();
    }
  }
}
