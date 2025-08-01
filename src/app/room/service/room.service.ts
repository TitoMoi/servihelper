import { RoomInterface } from "app/room/model/room.model";
import { readJSONSync, writeJson, writeJsonSync } from "fs-extra";
import { nanoid } from "nanoid/non-secure";

import { Injectable, inject } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";
import { TranslocoService } from "@ngneat/transloco";

@Injectable({
  providedIn: "root",
})
export class RoomService {
  private configService = inject(ConfigService);
  private translocoService = inject(TranslocoService);

  //flag to indicate that rooms file has changed
  hasChanged = true;
  //The array of rooms in memory
  #rooms: RoomInterface[] = [];
  //The map of rooms for look up of rooms
  #roomsMap: Map<string, RoomInterface> = new Map();

  getNameOrTranslation(r: RoomInterface): string {
    return r.name ? r.name : this.translocoService.translate(r.tKey);
  }
  /**
   *
   * @returns RoomInterface[] the array of rooms
   */
  getRooms(deepClone = false): RoomInterface[] {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#rooms) : this.#rooms;
    }
    this.hasChanged = false;
    this.#rooms = readJSONSync(this.configService.roomsPath);
    for (const room of this.#rooms) {
      this.#roomsMap.set(room.id, room);
    }
    return deepClone ? structuredClone(this.#rooms) : this.#rooms;
  }

  getRoomsLength() {
    return this.#rooms?.length;
  }

  /**
   *
   * @returns true if rooms are saved to disk or false
   */
  saveRoomsToFile(sync = false): boolean {
    //Write rooms back to file
    sync
      ? writeJsonSync(this.configService.roomsPath, this.#rooms)
      : writeJson(this.configService.roomsPath, this.#rooms);
    return true;
  }

  /**
   *
   * @param room the room to create
   * @returns the id of the new room
   */
  createRoom(room: RoomInterface): string {
    //Generate id for the room
    room.id = nanoid(this.configService.nanoMaxCharId);
    //trim the name
    room.name = room.name.trim();
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
        //trim the name
        room.name = room.name.trim();
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
