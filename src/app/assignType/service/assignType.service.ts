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
  fs: typeof fs;
  //where the file is depending on the context
  path: string;
  //The array of assignTypes in memory
  assignTypes: AssignTypeInterface[];
  //flag to indicate that assignTypes file has changed
  hasChanged: boolean;

  constructor(electronService: ElectronService) {
    this.fs = electronService.remote.require("fs-extra");

    this.path = APP_CONFIG.production
      ? //__dirname is where the .js file exists
        __dirname + "./assets/source/assignType.json"
      : "./assets/source/assignType.json";

    this.assignTypes = [];

    this.hasChanged = false;

    this.getAssignTypes();
  }

  async ensureAssignTypeFile() {
    const exists = await this.fs.pathExists(this.path);
    if (!exists) {
      //Create file
      await this.fs.ensureFile(this.path);
      //Put initial array
      await this.fs.writeJson(this.path, []);
    }
  }

  /**
   *
   * @returns AssignTypeInterface[] the array of assignTypes or null
   */
  async getAssignTypes(): Promise<AssignTypeInterface[]> {
    try {
      //Read assignTypes file if hasChanged or initial read
      if (this.hasChanged || !this.assignTypes.length) {
        const assignTypes: AssignTypeInterface[] = await this.fs.readJson(
          this.path
        );
        //Populate array in memory
        this.assignTypes = assignTypes;
        //clear flag
        this.hasChanged = false;
      }
      //return in memory assignTypes
      return this.assignTypes;
    } catch (err) {
      console.error("getAssignTypes", err);
      return null;
    }
  }

  /**
   *
   * @returns true if assignTypes are saved to disk or false
   */
  async saveAssignTypesToFile(): Promise<boolean> {
    try {
      //Write assignTypes back to file
      await this.fs.writeJson(this.path, this.assignTypes);
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
  async createAssignType(assignType: AssignTypeInterface): Promise<boolean> {
    //Generate id for the assignType
    assignType.id = nanoid();
    //add assignType to assignTypes
    this.assignTypes.push(assignType);
    //save assignTypes with the new assignType
    return await this.saveAssignTypesToFile();
  }

  /**
   *
   * @param id the id of the assignType to search for
   * @returns the assignType that is ALWAYS found
   */
  getAssignType(id: string): AssignTypeInterface {
    //search assignType
    for (const assignType of this.assignTypes) {
      if (assignType.id === id) {
        return assignType;
      }
    }
  }

  /**
   *
   * @param assignType the assignType to update
   * @returns true if assignType is updated and saved false otherwise
   */
  async updateAssignType(assignType: AssignTypeInterface): Promise<boolean> {
    //update assignType
    for (let i = 0; i < this.assignTypes.length; i++) {
      if (this.assignTypes[i].id === assignType.id) {
        this.assignTypes[i] = assignType;
        //save assignTypes with the updated assignType
        return await this.saveAssignTypesToFile();
      }
    }
    return false;
  }

  /**
   *
   * @param assignType the assignType to delete
   * @returns true if assignType is deleted and saved false otherwise
   */
  async deleteAssignType(id: string): Promise<boolean> {
    //delete assignType
    this.assignTypes = this.assignTypes.filter((b) => b.id !== id);
    //save assignTypes
    return await this.saveAssignTypesToFile();
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
