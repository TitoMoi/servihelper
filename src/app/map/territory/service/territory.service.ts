import { Injectable, inject } from "@angular/core";
import { TerritoryContextInterface } from "../../model/map.model";
import { ConfigService } from "app/config/service/config.service";
import { readJSONSync, writeJson } from "fs-extra";
import { nanoid } from "nanoid/non-secure";

@Injectable({
  providedIn: "root",
})
export class TerritoryService {
  private configService = inject(ConfigService);

  //flag to indicate that territories file has changed
  hasChanged = true;
  //The array of territories in memory
  #territories: TerritoryContextInterface[];
  //The territory of territories for look up of territories
  #territoriesMap: Map<string, TerritoryContextInterface> = new Map();

  /**
   *
   * @returns MapInterface[] the array of territories
   */
  getTerritories(deepClone = false): TerritoryContextInterface[] {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#territories) : this.#territories;
    }
    this.hasChanged = false;
    this.#territories = readJSONSync(this.configService.territoriesPath);
    for (const territory of this.#territories) {
      this.#territoriesMap.set(territory.id, territory);
    }
    return deepClone ? structuredClone(this.#territories) : this.#territories;
  }

  /**
   *
   * @param id the id of the territory to search for
   * @returns the territory that can be found
   */
  getTerritory(id: string | undefined) {
    //search territory
    return this.#territoriesMap.get(id);
  }

  /**
   *
   * @param territoryId the id of the territory to search for the name
   * @returns the name of the territory
   */
  getTerritoryNameById(territoryId: string): string {
    return this.#territoriesMap.get(territoryId)!.name;
  }

  /**
   *
   * @returns true if territories are saved to disk
   */
  #saveTerritoriesToFile(): boolean {
    //Write territories back to file
    writeJson(this.configService.territoriesPath, this.#territories);
    return true;
  }

  /**
   *
   * @param territory the territory to create
   * @returns the id of the new territory
   */
  createTerritory(territory: TerritoryContextInterface): string {
    //Generate id for the territory
    territory.id = nanoid(this.configService.nanoMaxCharId);
    //trim name
    territory.name = territory.name.trim();
    territory.m = new Date();
    //add territory to territories
    this.#territories.push(territory);
    this.#territoriesMap.set(territory.id, territory);
    //save territories with the new territory
    this.#saveTerritoriesToFile();

    return territory.id;
  }

  /**
   *
   * @param territory the territory to update
   * @returns true if territory is updated and saved false otherwise
   */
  updateTerritory(territory: TerritoryContextInterface): boolean {
    //update territory
    for (let i = 0; i < this.#territories.length; i++) {
      if (this.#territories[i].id === territory.id) {
        //trim name
        territory.name = territory.name.trim();
        territory.m = new Date();
        this.#territories[i] = territory;
        this.#territoriesMap.set(territory.id, territory);
        //save territories with the updated territory
        return this.#saveTerritoriesToFile();
      }
    }
    return false;
  }

  /**
   *
   * @param territory the territory to delete
   * @returns true if territory is deleted and saved false otherwise
   */
  deleteTerritory(id: string): boolean {
    //delete territory
    this.#territoriesMap.delete(id);
    this.#territories = this.#territories.filter((b) => b.id !== id);
    //save territories
    return this.#saveTerritoriesToFile();
  }

  /**
   *
   * @param territory the territory to return
   */
  returnTerritory(id: string) {
    //find territory
    const t = this.#territories.find((terr) => terr.id === id);
    //Mark it as returned
    t.returnedDates.push(new Date());
    //Update territory
    this.updateTerritory(t);
  }

  /**
   * @param id the id of the territory group we want to delete
   */
  deleteTerritoryGroupById(id: string): boolean {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.#territories.length; i++) {
      this.#territories[i].groups = this.#territories[i].groups.filter((gId) => gId !== id);

      this.#territoriesMap.set(this.#territories[i].id, this.#territories[i]);
    }
    return this.#saveTerritoriesToFile();
  }
}