import { Injectable, inject } from '@angular/core';
import { TerritoryContextClass, TerritoryContextInterface } from '../../model/map.model';
import { ConfigService } from 'app/config/service/config.service';
import { readFileSync, writeFileSync } from 'fs-extra';
import { nanoid } from 'nanoid/non-secure';
import { LockService } from 'app/lock/service/lock.service';
import { inflate, deflate } from 'pako';
import { TerrImageService } from './terr-image.service';
import { PolygonService } from './polygon.service';
import { differenceInMonths } from 'date-fns';
@Injectable({
  providedIn: 'root'
})
export class TerritoryService {
  private configService = inject(ConfigService);
  private lockService = inject(LockService);
  private terrImageService = inject(TerrImageService);
  private polygonService = inject(PolygonService);

  //flag to indicate that territories file has changed
  hasChanged = true;
  //The array of territories in memory
  #territories: TerritoryContextClass[] = [];
  //The territory of territories for look up of territories
  #territoriesMap: Map<string, TerritoryContextClass> = new Map();

  /**
   *
   * @returns MapInterface[] the array of territories
   */
  getTerritories(deepClone = false): TerritoryContextClass[] {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#territories) : this.#territories;
    }
    this.hasChanged = false;

    const territoryContent = readFileSync(this.configService.territoriesPath);

    if (territoryContent) {
      this.#territories = (
        JSON.parse(inflate(territoryContent, { to: 'string' })) as TerritoryContextInterface[]
      ).map(t => new TerritoryContextClass(t));

      this.updateTerritoriesMap();
    }

    return deepClone ? structuredClone(this.#territories) : this.#territories;
  }

  updateTerritoriesMap() {
    for (const territory of this.#territories) {
      this.#territoriesMap.set(territory.id, territory);
    }
  }

  /**
   *
   * @param id the id of the territory to search for
   * @returns the territory that can be found, if not found returns a new territory
   */
  getTerritory(id: string): TerritoryContextClass {
    const t = this.#territoriesMap.get(id);
    return t ? t : new TerritoryContextClass();
  }

  /**
   *
   * @param id the id of the polygon to search by
   * @returns the territory that owns that polygon
   */
  getTerritoryByPolygonId(polId: string | undefined) {
    return this.#territories.find(t => t.poligonId === polId);
  }

  /**
   *
   * @param tgId the territory group id
   * @returns a list of territories
   */
  getTerritoriesByTerritoryGroupId(tgId: string) {
    return this.#territories.filter(t => t.groups.includes(tgId));
  }

  /**
   * @param id the id of the territory to search by
   * @returns true if the territory is currently assigned, false otherwise
   */
  isActiveTerritory(t: TerritoryContextInterface): boolean {
    return t.assignedDates.length > t.returnedDates.length;
  }

  /**
   * @param id the id of the territory to search by
   * @returns true if the territory is returned, false otherwise
   */
  isReturnedTerritory(t: TerritoryContextInterface): boolean {
    return t.assignedDates.length === t.returnedDates.length;
  }

  /**
   * Assigned more than 12 months or returned with more than 12 months without being worked
   */
  isOverdueTerritory(t: TerritoryContextInterface): boolean {
    //It's active or returned?
    const isActiveTerritory = this.isActiveTerritory(t);
    const territoryLastDate = new Date(
      isActiveTerritory ? t.assignedDates.at(-1) : t.returnedDates.at(-1)
    );
    if (territoryLastDate) {
      const distanceInMonths = Math.abs(differenceInMonths(territoryLastDate, new Date()));
      if (distanceInMonths >= 12) return true;
      return false;
    }
  }
  /**
   * Assigned more than 4 months or returned with more than 4 months without being worked
   */
  isMoreThan4Months(t: TerritoryContextInterface): boolean {
    //It's active or returned?
    const isActiveTerritory = this.isActiveTerritory(t);
    const territoryLastDate = new Date(
      isActiveTerritory ? t.assignedDates.at(-1) : t.returnedDates.at(-1)
    );
    if (territoryLastDate) {
      const distanceInMonths = Math.abs(differenceInMonths(territoryLastDate, new Date()));
      if (distanceInMonths >= 4) return true;
      return false;
    }
  }

  /**
   * @param id the id of the territory to search by
   * @returns true if the territory has not been assigned yet, false otherwise
   */
  isNeverAssignedTerritory(t: TerritoryContextInterface): boolean {
    return !t.assignedDates.length && !t.returnedDates.length;
  }

  /**
   *
   * @param territoryId the id of the territory to search by
   * @returns the name of the territory
   */
  getTerritoryNameById(territoryId: string): string {
    return this.#territoriesMap.get(territoryId).name;
  }

  /**
   * Saves the last modified dates for all territories.
   */
  massiveSaveTerritoriesDates() {
    this.#saveTerritoriesToFile();
    this.updateTerritoriesMap();
  }

  #saveTerritoriesToFile() {
    const gziped = deflate(JSON.stringify(this.#territories), { to: 'string' });

    this.lockService.updateTimestamp();
    return writeFileSync(this.configService.territoriesPath, gziped);
  }

  /**
   *
   * @param territory the territory to create
   * @returns the id of the new territory
   */
  createTerritory(territory: TerritoryContextClass) {
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
  }

  /**
   *
   * @param territory the territory to update
   * @returns true if territory is updated and saved false otherwise
   */
  updateTerritory(territory: TerritoryContextClass) {
    //update territory
    for (let i = 0; i < this.#territories.length; i++) {
      if (this.#territories[i].id === territory.id) {
        //trim name
        territory.name = territory.name.trim();
        territory.m = new Date();
        this.#territories[i] = territory;
        this.#territoriesMap.set(territory.id, territory);
        break;
      }
    }
    //save territories with the updated territory
    return this.#saveTerritoriesToFile();
  }

  /**
   *
   * @param territory the territory to delete
   * @returns true if territory is deleted and saved false otherwise
   */
  deleteTerritory(id: string) {
    //first delete image or polygon associated

    const terr = this.getTerritory(id);

    if (terr.imageId) {
      this.terrImageService.deleteImage(terr.imageId);
    }
    if (terr.poligonId) {
      this.polygonService.deletePolygon(terr.poligonId);
    }

    //delete territory
    this.#territoriesMap.delete(id);
    this.#territories = this.#territories.filter(b => b.id !== id);

    //save territories
    return this.#saveTerritoriesToFile();
  }

  /** @param id the id of the participant */
  returnActiveTerritoriesByParticipant(id: string) {
    for (const t of this.#territories) {
      //Territory is unassigned
      if (t.assignedDates.length === t.returnedDates.length) continue;
      if (t.participants.at(-1) === id) {
        this.returnTerritory(t.id, new Date());
      }
    }
  }

  /**
   *
   * @param territory the territory to return
   */
  returnTerritory(id: string, returnDate: Date) {
    //find territory
    const t = this.#territories.find(terr => terr.id === id);
    //Mark it as returned
    t.returnedDates.push(returnDate);
    //Update territory
    this.updateTerritory(t);
  }

  /**
   * @param id the id of the territory group we want to delete
   * if the territory groups remains empty at the end then the territory is also removed
   */
  deleteTerritoryGroupById(id: string) {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.#territories.length; i++) {
      this.#territories[i].groups = this.#territories[i].groups.filter(gId => gId !== id);

      this.#territoriesMap.set(this.#territories[i].id, this.#territories[i]);
    }
    //Remove the empty groups territories
    this.#territories = this.#territories.filter(t => t.groups.length);

    return this.#saveTerritoriesToFile();
  }
}
