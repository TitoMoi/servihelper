import { Injectable } from "@angular/core";
import { APP_CONFIG } from "environments/environment";
import { RoomInterface } from "app/room/model/room.model";
import * as fs from "fs-extra";
import { ElectronService } from "app/services/electron.service";
import { nanoid } from "nanoid/non-secure";

@Injectable({
  providedIn: "root",
})
export class RoomService {
  //fs-extra api
  fs: typeof fs;
  //where the file is depending on the context
  path: string;

  //The array of rooms in memory
  rooms: RoomInterface[];
  //flag to indicate that rooms file has changed
  hasChanged: boolean;

  constructor(electronService: ElectronService) {
    this.fs = electronService.remote.require("fs-extra");

    this.path = APP_CONFIG.production
      ? //__dirname is where the .js file exists
        __dirname + "./assets/source/room.json"
      : "./assets/source/room.json";

    this.rooms = [];

    this.hasChanged = false;

    this.getRooms();
  }

  /**
   * Check if rooms file exists, if not creates it and populates with initial array, then hasChanged is marked.
   */
  async ensureRoomFile() {
    const exists = await this.fs.pathExists(this.path);
    if (!exists) {
      //Create file
      await this.fs.ensureFile(this.path);
      //Put initial array
      await this.fs.writeJson(this.path, []);

      this.hasChanged = true;
    }
  }

  /**
   *
   * @returns RoomInterface[] the array of rooms or null
   */
  async getRooms(): Promise<RoomInterface[]> {
    try {
      //Read rooms file if hasChanged or initial read
      if (this.hasChanged || !this.rooms.length) {
        const rooms: RoomInterface[] = await this.fs.readJson(this.path);
        //Populate array in memory
        this.rooms = rooms;
        //clear flag
        this.hasChanged = false;
      }
      //return in memory rooms
      return this.rooms;
    } catch (err) {
      console.error("getRooms", err);
      return null;
    }
  }

  /**
   *
   * @returns true if rooms are saved to disk or false
   */
  async saveRoomsToFile(): Promise<boolean> {
    try {
      //Write rooms back to file
      await this.fs.writeJson(this.path, this.rooms);
      //Flag
      this.hasChanged = true;
      return true;
    } catch (err) {
      console.error("saveRooms", err);
      return false;
    }
  }

  /**
   *
   * @param room the room to create
   * @returns true if room is saved false if not
   */
  async createRoom(room: RoomInterface): Promise<boolean> {
    //Generate id for the room
    room.id = nanoid();
    //add room to rooms
    this.rooms.push(room);
    //save rooms with the new room
    return await this.saveRoomsToFile();
  }

  /**
   *
   * @param id the id of the room to search for
   * @returns the room that is ALWAYS found
   */
  getRoom(id: string): RoomInterface {
    //search room
    for (const room of this.rooms) {
      if (room.id === id) {
        return room;
      }
    }
  }

  /**
   *
   * @param room the room to update
   * @returns true if room is updated and saved false otherwise
   */
  async updateRoom(room: RoomInterface): Promise<boolean> {
    //update room
    for (let i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].id === room.id) {
        this.rooms[i] = room;
        //save rooms with the updated room
        return await this.saveRoomsToFile();
      }
    }
    return false;
  }

  /**
   *
   * @param room the room to delete
   * @returns true if room is deleted and saved false otherwise
   */
  async deleteRoom(id: string): Promise<boolean> {
    //delete room
    this.rooms = this.rooms.filter((b) => b.id !== id);
    //save rooms
    return await this.saveRoomsToFile();
  }
}
