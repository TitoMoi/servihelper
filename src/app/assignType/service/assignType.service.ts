import { Injectable } from "@angular/core";
import { APP_CONFIG } from "environments/environment";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import * as fs from "fs-extra";
import { ElectronService } from "app/services/electron.service";
import { nanoid } from "nanoid/non-secure";

@Injectable({
  providedIn: "root",
})
export class AssignTypeService {
  //fs-extra api
  fs: typeof fs = this.electronService.remote.require("fs-extra");
  //where the file is depending on the context
  path: string = APP_CONFIG.production
    ? //__dirname is where the .js file exists
      __dirname + "/assets/source/assignType.json"
    : "./assets/source/assignType.json";
  //The array of assignTypes in memory
  #assignTypes: AssignTypeInterface[] = undefined;
  //flag to indicate that assignTypes file has changed
  hasChanged: boolean = true;

  constructor(private electronService: ElectronService) {}

  /**
   *
   * @returns AssignTypeInterface[] the array of assignTypes
   */
  getAssignTypes(deepClone = false): AssignTypeInterface[] {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#assignTypes) : this.#assignTypes;
    }
    this.hasChanged = false;
    this.#assignTypes = this.fs.readJSONSync(this.path);
    return deepClone ? structuredClone(this.#assignTypes) : this.#assignTypes;
  }

  /**
   *
   * @returns true if assignTypes are saved to disk or false
   */
  saveAssignTypesToFile(): boolean {
    try {
      //Write assignTypes back to file
      this.fs.writeJson(this.path, this.#assignTypes);
      //Flag
      this.hasChanged = true;
      return true;
    } catch (err) {
      console.error("saveAssignTypes", err);
      return false;
    }
  }

  /**
   *
   * @param assignType the assignType to create
   * @returns true if assignType is saved false if not
   */
  createAssignType(assignType: AssignTypeInterface): boolean {
    //Generate id for the assignType
    assignType.id = nanoid();
    //add assignType to assignTypes
    this.#assignTypes.push(assignType);
    //save assignTypes with the new assignType
    return this.saveAssignTypesToFile();
  }

  /**
   *
   * @param id the id of the assignType to search for
   * @returns the assignType that is ALWAYS found
   */
  getAssignType(id: string): AssignTypeInterface {
    //search assignType
    for (const assignType of this.#assignTypes) {
      if (assignType.id === id) {
        return assignType;
      }
    }
  }

  /**
   *
   * @param assignTypeName the name of the assignType to look for
   * @returns the assignType
   */
  getAssignTypeByName(assignTypeName: string) {
    //search assignType
    for (const assignType of this.#assignTypes) {
      if (assignType.name === assignTypeName) {
        return assignType;
      }
    }
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
        this.#assignTypes[i] = assignType;
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
    this.#assignTypes = this.#assignTypes.filter((b) => b.id !== id);
    //save assignTypes
    return this.saveAssignTypesToFile();
  }

  /**
   *
   * @param assignTypeId the assignType id to search
   * @returns the assign type name
   */
  getAssignTypeNameById(assignTypeId: string) {
    const name = this.getAssignType(assignTypeId).name;
    return name;
  }
}
