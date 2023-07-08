import { Injectable, inject } from "@angular/core";
import { MapInterface } from "../model/map.model";
import { ConfigService } from "app/config/service/config.service";
import { readJSONSync, writeJson } from "fs-extra";
import { nanoid } from "nanoid/non-secure";

@Injectable({
  providedIn: "root",
})
export class MapService {
  private configService = inject(ConfigService);

  //flag to indicate that maps file has changed
  hasChanged = true;
  //The array of maps in memory
  #maps: MapInterface[];
  //The map of maps for look up of maps
  #mapsMap: Map<string, MapInterface> = new Map();

  /**
   *
   * @returns MapInterface[] the array of maps
   */
  getMaps(deepClone = false): MapInterface[] {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#maps) : this.#maps;
    }
    this.hasChanged = false;
    this.#maps = readJSONSync(this.configService.mapsPath);
    for (const map of this.#maps) {
      this.#mapsMap.set(map.id, map);
    }
    return deepClone ? structuredClone(this.#maps) : this.#maps;
  }

  /**
   *
   * @param mapId the id of the map to search for the name
   * @returns the name of the map
   */
  getMapNameById(mapId: string): string {
    return this.#mapsMap.get(mapId)!.name;
  }

  /**
   *
   * @returns true if maps are saved to disk
   */
  #saveMapsToFile(): boolean {
    //Write maps back to file
    writeJson(this.configService.mapsPath, this.#maps);
    return true;
  }

  /**
   *
   * @param map the map to create
   * @returns the id of the new map
   */
  createMap(map: MapInterface): string {
    //Generate id for the map
    map.id = nanoid(this.configService.nanoMaxCharId);
    map.m = new Date();
    //add map to maps
    this.#maps.push(map);
    this.#mapsMap.set(map.id, map);
    //save maps with the new map
    this.#saveMapsToFile();

    return map.id;
  }

  /**
   *
   * @param id the id of the map to search for
   * @returns the map that is ALWAYS found
   */
  getMap(id: string): MapInterface {
    //search map
    return this.#mapsMap.get(id)!;
  }

  /**
   *
   * @param map the map to update
   * @returns true if map is updated and saved false otherwise
   */
  updateMap(map: MapInterface): boolean {
    //update map
    for (let i = 0; i < this.#maps.length; i++) {
      if (this.#maps[i].id === map.id) {
        map.m = new Date();
        this.#maps[i] = map;
        this.#mapsMap.set(map.id, map);
        //save maps with the updated map
        return this.#saveMapsToFile();
      }
    }
    return false;
  }

  /**
   *
   * @param map the map to delete
   * @returns true if map is deleted and saved false otherwise
   */
  deleteMap(id: string): boolean {
    //delete map
    this.#mapsMap.delete(id);
    this.#maps = this.#maps.filter((b) => b.id !== id);
    //save maps
    return this.#saveMapsToFile();
  }
}
