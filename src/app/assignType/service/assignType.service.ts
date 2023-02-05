import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { APP_CONFIG } from "environments/environment";
import { readJSONSync, writeJson } from "fs-extra";
import { nanoid } from "nanoid/non-secure";

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class AssignTypeService {
  //where the file is depending on the context
  path: string = APP_CONFIG.production
    ? //__dirname is where the .js file exists
      __dirname + "/assets/source/assignType.json"
    : "./assets/source/assignType.json";
  //flag to indicate that assignTypes file has changed
  hasChanged = true;
  //The array of assignTypes in memory
  #assignTypes: AssignTypeInterface[] = undefined;
  //The map of assignTypes for look up of by id
  #assignTypesMap: Map<string, AssignTypeInterface> = new Map();
  //The map of assignTypes for look up of by name
  #assignTypesMapByName: Map<string, AssignTypeInterface> = new Map();

  constructor() {}

  /**
   *
   * @returns AssignTypeInterface[] the array of assignTypes
   */
  getAssignTypes(deepClone = false): AssignTypeInterface[] {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#assignTypes) : this.#assignTypes;
    }
    this.hasChanged = false;
    this.#assignTypes = readJSONSync(this.path);
    for (const assignType of this.#assignTypes) {
      this.#assignTypesMap.set(assignType.id, assignType);
    }
    for (const assignType of this.#assignTypes) {
      this.#assignTypesMapByName.set(assignType.name, assignType);
    }
    return deepClone ? structuredClone(this.#assignTypes) : this.#assignTypes;
  }

  /**
   *
   * @returns true if assignTypes are saved to disk or false
   */
  saveAssignTypesToFile(): boolean {
    //Write assignTypes back to file
    writeJson(this.path, this.#assignTypes);
    return true;
  }

  /**
   *
   * @param assignType the assignType to create
   * @returns the id of the created assign type
   */
  createAssignType(assignType: AssignTypeInterface): string {
    //Generate id for the assignType
    assignType.id = nanoid();
    assignType.name = assignType.name.trim();
    //add assignType to assignTypes
    this.#assignTypes.push(assignType);
    this.#assignTypesMap.set(assignType.id, assignType);
    this.#assignTypesMapByName.set(assignType.name, assignType);
    //save assignTypes with the new assignType
    this.saveAssignTypesToFile();

    return assignType.id;
  }

  /**
   *
   * @param id the id of the assignType to search for
   * @returns the assignType that is ALWAYS found
   */
  getAssignType(id: string): AssignTypeInterface {
    return this.#assignTypesMap.get(id);
  }

  /**
   *
   * @param assignTypeName the name of the assignType to look for
   * @returns the assignType
   */
  getAssignTypeNameById(assignTypeId: string): string {
    return this.#assignTypesMap.get(assignTypeId).name;
  }

  /**
   *
   * @param assignTypeName the name of the assignType to look for
   * @returns the assignType
   */
  getAssignTypeByName(assignTypeName: string): AssignTypeInterface {
    return this.#assignTypesMapByName.get(assignTypeName);
  }

  /**
   *
   * @param assignType the assignType to update
   * @returns true if assignType is updated and saved false otherwise
   */
  updateAssignType(assignType: AssignTypeInterface): boolean {
    assignType.name = assignType.name.trim();
    //update assignType
    for (let i = 0; i < this.#assignTypes.length; i++) {
      if (this.#assignTypes[i].id === assignType.id) {
        this.#assignTypes[i] = assignType;
        this.#assignTypesMap.set(assignType.id, assignType);
        this.#assignTypesMapByName.set(assignType.name, assignType);
        //save assignTypes with the updated assignType
        return this.saveAssignTypesToFile();
      }
    }
    return false;
  }

  /**
   *
   * @param assignType the assignType to delete
   * @returns true if assignType is deleted and saved false otherwise
   */
  deleteAssignType(id: string): boolean {
    //delete assignType
    const assignType = this.getAssignType(id);
    this.#assignTypesMap.delete(id);
    this.#assignTypesMapByName.delete(assignType.name);
    this.#assignTypes = this.#assignTypes.filter((b) => b.id !== id);
    //save assignTypes
    return this.saveAssignTypesToFile();
  }
}
