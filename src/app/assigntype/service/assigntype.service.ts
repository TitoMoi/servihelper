import { AssignTypeInterface, AssignTypes } from "app/assigntype/model/assigntype.model";
import { readJSONSync, writeJson, writeJsonSync } from "fs-extra";
import { nanoid } from "nanoid/non-secure";

import { Injectable } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";
import { TranslocoService } from "@ngneat/transloco";

@Injectable({
  providedIn: "root",
})
export class AssignTypeService {
  //flag to indicate that assignTypes file has changed
  hasChanged = true;
  //The array of assignTypes in memory
  #assignTypes: AssignTypeInterface[] = [];
  //The map of assignTypes for look up of by id
  #assignTypesMap: Map<string, AssignTypeInterface> = new Map();

  //Section
  treasuresAssignmentTypes: AssignTypes[] = ["spiritualGems", "treasures", "bibleReading"];

  //Section
  improvePreachingAssignmentTypes: AssignTypes[] = [
    "interestInOthers",
    "initialCall",
    "returnVisit",
    "bibleStudy",
    "talk",
    "explainBeliefs",
  ];

  //Section
  liveAsChristiansAssignmentTypes: AssignTypes[] = [
    "livingAsChristians",
    "congregationBibleStudy",
  ];

  constructor(
    private configService: ConfigService,
    private translocoService: TranslocoService
  ) {}

  getNameOrTranslation(at: AssignTypeInterface) {
    return at.name ? at.name : this.translocoService.translate(at.tKey);
  }

  getNameOrTranslationByType(type: AssignTypes) {
    const at = this.#assignTypes.find((at) => at.type === type);
    return this.getNameOrTranslation(at);
  }

  isAllowedTypeForS89(type: string): boolean {
    if (!type) return false;

    return (
      type === "bibleReading" ||
      type === "initialCall" ||
      type === "returnVisit" ||
      type === "bibleStudy" ||
      type === "talk"
    );
  }

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
    return deepClone ? structuredClone(this.#assignTypes) : this.#assignTypes;
  }

  getAssignTypesLength() {
    return this.#assignTypes?.length;
  }

  /** Return an array of assign types ids */
  getAssignTypesIdsByRole() {
    const roles = this.configService.getRoles();
    const currentRoleId = this.configService.getCurrentRoleId();
    if (this.configService.isCurrentRoleAdmin()) {
      return this.getAssignTypes().map((at) => at.id);
    } else if (roles) {
      return roles.find((r) => r.id === currentRoleId).assignTypesId;
    }
  }

  /**
   *
   * @returns true if assignTypes are saved to disk or false
   */
  saveAssignTypesToFile(sync = false): boolean {
    //Write assignTypes back to file
    sync
      ? writeJsonSync(this.configService.assignTypesPath, this.#assignTypes)
      : writeJson(this.configService.assignTypesPath, this.#assignTypes);
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
        break;
      }
    }
    //save assignTypes with the updated assignType
    return this.saveAssignTypesToFile();
  }

  /**
   *
   * @param assignType the assignType to delete
   * @returns true if assignType is deleted and saved false otherwise
   */
  deleteAssignType(id: string): boolean {
    //delete assignType
    this.#assignTypesMap.delete(id);
    this.#assignTypes = this.#assignTypes.filter((b) => b.id !== id);
    //save assignTypes
    return this.saveAssignTypesToFile();
  }
}
