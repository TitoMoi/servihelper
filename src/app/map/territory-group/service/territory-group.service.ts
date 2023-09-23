import { Injectable, inject } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";
import { TerritoryGroupInterface } from "../../model/map.model";
import { readJSONSync, writeJson } from "fs-extra";
import { nanoid } from "nanoid/non-secure";
import { LockService } from "app/lock/service/lock.service";

@Injectable({
  providedIn: "root",
})
export class TerritoryGroupService {
  private configService = inject(ConfigService);
  private lockService = inject(LockService);

  //flag to indicate that territoryGroups file has changed
  hasChanged = true;
  //The array of territoryGroups in memory
  #territoryGroups: TerritoryGroupInterface[];
  //The map of territoryGroups to look up for group maps
  #territoryGroupsMap: Map<string, TerritoryGroupInterface> = new Map();
  /**
   *
   * @returns TerritoryGroupInterface[] the array of territoryGroups
   */
  getTerritoryGroups(deepClone = false): TerritoryGroupInterface[] {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#territoryGroups) : this.#territoryGroups;
    }
    this.hasChanged = false;
    this.#territoryGroups = readJSONSync(this.configService.territoryGroupsPath);
    for (const gm of this.#territoryGroups) {
      this.#territoryGroupsMap.set(gm.id!, gm);
    }
    return deepClone ? structuredClone(this.#territoryGroups) : this.#territoryGroups;
  }
  /**
   *
   * @returns true if territoryGroups are saved to disk
   */
  #saveTerritoryGroupsToFile(): boolean {
    //Write territoryGroups back to file
    writeJson(this.configService.territoryGroupsPath, this.#territoryGroups);
    this.lockService.updateTimestamp();
    return true;
  }

  /**
   *
   * @param territoryGroup the territoryGroup to create
   * @returns the id of the new territoryGroup
   */
  createTerritoryGroup(territoryGroup: TerritoryGroupInterface): string {
    //Generate id for the territoryGroup
    territoryGroup.id = nanoid(this.configService.nanoMaxCharId);
    //add territoryGroup to territoryGroups
    this.#territoryGroups.push(territoryGroup);
    this.#territoryGroupsMap.set(territoryGroup.id, territoryGroup);
    //save territoryGroups with the new territoryGroup
    this.#saveTerritoryGroupsToFile();

    return territoryGroup.id;
  }

  /**
   *
   * @param id the id of the territoryGroup to search for
   * @returns the territoryGroup or undefined if not exists
   */
  getTerritoryGroup(id: string): TerritoryGroupInterface | undefined {
    return this.#territoryGroupsMap.get(id);
  }

  /**
   *
   * @param territoryGroup the territoryGroup to update
   * @returns true if territoryGroup is updated and saved false otherwise
   */
  updateTerritoryGroup(territoryGroup: TerritoryGroupInterface): boolean {
    //update territoryGroup
    for (let i = 0; i < this.#territoryGroups.length; i++) {
      if (this.#territoryGroups[i].id === territoryGroup.id) {
        this.#territoryGroups[i] = territoryGroup;
        this.#territoryGroupsMap.set(territoryGroup.id!, territoryGroup);
        //save territoryGroups with the updated territoryGroup
        return this.#saveTerritoryGroupsToFile();
      }
    }
    return false;
  }

  /**
   *
   * @param territoryGroup the territoryGroup to delete
   * @returns true if territoryGroup is deleted and saved
   */
  deleteTerritoryGroup(id: string): boolean {
    //delete territoryGroup
    this.#territoryGroupsMap.delete(id);
    this.#territoryGroups = this.#territoryGroups.filter((b) => b.id !== id);
    //save territoryGroups
    return this.#saveTerritoryGroupsToFile();
  }
}
