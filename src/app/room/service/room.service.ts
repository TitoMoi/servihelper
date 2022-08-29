import { RoomInterface } from "app/room/model/room.model";
import { ElectronService } from "app/services/electron.service";
import { APP_CONFIG } from "environments/environment";
import * as fs from "fs-extra";
import { nanoid } from "nanoid/non-secure";

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class RoomService {
  //fs-extra api
  fs: typeof fs = this.electronService.remote.require("fs-extra");
  //where the file is depending on the context
  path: string = APP_CONFIG.production
    ? //__dirname is where the .js file exists
      __dirname + "/assets/source/room.json"
    : "./assets/source/room.json";

  //The array of rooms in memory
  #rooms: RoomInterface[] = undefined;
  //The map of rooms for look up of rooms
  #roomsMap: Map<string, RoomInterface> = new Map();
  //flag to indicate that rooms file has changed
  hasChanged = true;

  constructor(private electronService: ElectronService) {}

  /**
   *
   * @returns RoomInterface[] the array of rooms
   */
  getRooms(deepClone = false): RoomInterface[] {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#rooms) : this.#rooms;
    }
    this.hasChanged = false;
    this.#rooms = this.fs.readJSONSync(this.path);
    for (const room of this.#rooms) {
      this.#roomsMap.set(room.id, room);
    }
    return deepClone ? structuredClone(this.#rooms) : this.#rooms;
  }

  /**
   *
   * @param roomId the id of the room to search for the name
   * @returns the name of the room
   */
  getRoomNameById(roomId: string): string {
    return this.#roomsMap.get(roomId).name;
  }

  /**
   *
   * @returns true if rooms are saved to disk or false
   */
  saveRoomsToFile(): boolean {
    //Write rooms back to file
    this.fs.writeJson(this.path, this.#rooms);
    return true;
  }

  /**
   *
   * @param room the room to create
   * @returns true if room is saved false if not
   */
  createRoom(room: RoomInterface): string {
    //Generate id for the room
    room.id = nanoid();
    //add room to rooms
    this.#rooms.push(room);
    this.#roomsMap.set(room.id, room);
    //save rooms with the new room
    this.saveRoomsToFile();

    return room.id;
  }

  /**
   *
   * @param id the id of the room to search for
   * @returns the room that is ALWAYS found
   */
  getRoom(id: string): RoomInterface {
    //search room
    return this.#roomsMap.get(id);
  }

  /**
   *
   * @param room the room to update
   * @returns true if room is updated and saved false otherwise
   */
  updateRoom(room: RoomInterface): boolean {
    //update room
    for (let i = 0; i < this.#rooms.length; i++) {
      if (this.#rooms[i].id === room.id) {
        this.#rooms[i] = room;
        this.#roomsMap.set(room.id, room);
        //save rooms with the updated room
        return this.saveRoomsToFile();
      }
    }
    return false;
  }

  /**
   *
   * @param room the room to delete
   * @returns true if room is deleted and saved false otherwise
   */
  deleteRoom(id: string): boolean {
    //delete room
    this.#roomsMap.delete(id);
    this.#rooms = this.#rooms.filter((b) => b.id !== id);
    //save rooms
    return this.saveRoomsToFile();
  }
}
