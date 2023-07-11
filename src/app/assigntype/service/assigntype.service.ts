import { AssignTypeInterface } from "app/assigntype/model/assigntype.model";
import { readJSONSync, writeJson } from "fs-extra";
import { nanoid } from "nanoid/non-secure";

import { Injectable } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";

@Injectable({
  providedIn: "root",
})
export class AssignTypeService {
  //flag to indicate that assignTypes file has changed
  hasChanged = true;
  //The array of assignTypes in memory
  #assignTypes: AssignTypeInterface[] = undefined;
  //The map of assignTypes for look up of by id
  #assignTypesMap: Map<string, AssignTypeInterface> = new Map();
  //The map of assignTypes for look up of by name
  #assignTypesMapByName: Map<string, AssignTypeInterface> = new Map();

  constructor(private configService: ConfigService) {}

  /**
   *
   * @returns AssignTypeInterface[] the array of assignTypes
   */
  getAssignTypes(deepClone = false): AssignTypeInterface[] {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#assignTypes) : this.#assignTypes;
    }
    this.hasChanged = false;
    this.#assignTypes = readJSONSync(this.configService.assignTypesPath);
    for (const assignType of this.#assignTypes) {
      this.#assignTypesMap.set(assignType.id, assignType);
    }
    for (const assignType of this.#assignTypes) {
      this.#assignTypesMapByName.set(assignType.name, assignType);
    }
    return deepClone ? structuredClone(this.#assignTypes) : this.#assignTypes;
  }

  getAssignTypesLength() {
    return this.#assignTypes?.length;
  }

  /**
   *
   * @returns true if assignTypes are saved to disk or false
   */
  saveAssignTypesToFile(): boolean {
    //Write assignTypes back to file
    writeJson(this.configService.assignTypesPath, this.#assignTypes);
    return true;
  }

  /**
   *
   * @param assignType the assignType to create
   * @returns the id of the created assign type
   */
  createAssignType(assignType: AssignTypeInterface): string {
    //Generate id for the assignType
    assignType.id = nanoid(this.configService.nanoMaxCharId);
    //trim the name
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
    //update assignType
    for (let i = 0; i < this.#assignTypes.length; i++) {
      if (this.#assignTypes[i].id === assignType.id) {
        //trim name
        assignType.name = assignType.name.trim();
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
