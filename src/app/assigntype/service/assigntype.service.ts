/* eslint-disable complexity */
import { AssignTypeInterface, AssignTypes } from 'app/assigntype/model/assigntype.model';
import { readJSONSync, writeJson, writeJsonSync } from 'fs-extra';
import { nanoid } from 'nanoid/non-secure';

import { Injectable, inject } from '@angular/core';
import { ConfigService } from 'app/config/service/config.service';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root'
})
export class AssignTypeService {
  private configService = inject(ConfigService);
  private translocoService = inject(TranslocoService);

  //flag to indicate that assignTypes file has changed
  hasChanged = true;
  //The array of assignTypes in memory
  #assignTypes: AssignTypeInterface[] = [];
  //The map of assignTypes for look up of by id
  #assignTypesMap: Map<string, AssignTypeInterface> = new Map();

  readonly SPIRITUAL_GEMS = 'spiritualGems';
  readonly TREASURES = 'treasures';
  readonly BIBLE_READING = 'bibleReading';
  readonly ANALYSIS_AUDIENCE = 'analysysAudience';
  readonly INTEREST_IN_OTHERS = 'interestInOthers'; //ToDo: This one is ANALYSIS_AUDIENCE, we keep it for compatibility, must be removed on v6
  readonly INITIAL_CALL = 'initialCall';
  readonly RETURN_VISIT = 'returnVisit';
  readonly TALK = 'talk';
  readonly BIBLE_STUDY = 'bibleStudy';
  readonly INITIAL_PRAYER = 'initialPrayer';
  readonly ENDING_PRAYER = 'endingPrayer';
  readonly LIVING_AS_CHRISTIANS = 'livingAsChristians';
  readonly EXPLAIN_BELIEFS = 'explainBeliefs';
  readonly CONGREGATION_BIBLE_STUDY = 'congregationBibleStudy';

  //Section as jw color bands
  treasuresAssignmentTypes: AssignTypes[] = [
    this.SPIRITUAL_GEMS,
    this.TREASURES,
    this.BIBLE_READING
  ];

  //Section as jw color bands
  improvePreachingAssignmentTypes: AssignTypes[] = [
    this.ANALYSIS_AUDIENCE,
    this.INTEREST_IN_OTHERS, //ToDo: For compatibility, must be removed on v6
    this.INITIAL_CALL,
    this.RETURN_VISIT,
    this.BIBLE_STUDY,
    this.TALK,
    this.EXPLAIN_BELIEFS
  ];

  //Section as jw color bands
  liveAsChristiansAssignmentTypes: AssignTypes[] = [
    this.LIVING_AS_CHRISTIANS,
    this.CONGREGATION_BIBLE_STUDY
  ];

  getNameOrTranslation(at: AssignTypeInterface) {
    return at.name ? at.name : this.translocoService.translate(at.tKey);
  }

  getNameOrTranslationByType(type: AssignTypes) {
    let at = this.#assignTypes.find(at => at.type === type);
    // retro compatibility with wrong interest type
    if (!at) {
      at = this.#assignTypes.find(at => at.type === 'interestInOthers');
    }
    return this.getNameOrTranslation(at);
  }

  getTranslationForAssignTypes() {
    const translations = [];
    translations.push(this.getNameOrTranslationByType(this.BIBLE_READING));
    translations.push(this.getNameOrTranslationByType(this.ANALYSIS_AUDIENCE));
    translations.push(this.getNameOrTranslationByType(this.INITIAL_CALL));
    translations.push(this.getNameOrTranslationByType(this.RETURN_VISIT));
    translations.push(this.getNameOrTranslationByType(this.TALK));
    translations.push(this.getNameOrTranslationByType(this.BIBLE_STUDY));
    translations.push(this.getNameOrTranslationByType(this.EXPLAIN_BELIEFS));
    return translations.filter(t => t).toString();
  }

  getTranslationForPrayers() {
    const translations = [];
    translations.push(this.getNameOrTranslationByType(this.INITIAL_PRAYER));
    translations.push(this.getNameOrTranslationByType(this.ENDING_PRAYER));
    return translations.filter(t => t).toString();
  }

  getTranslationForTreasuresAndOthers() {
    const translations = [];
    translations.push(this.getNameOrTranslationByType(this.TREASURES));
    translations.push(this.getNameOrTranslationByType(this.SPIRITUAL_GEMS));
    translations.push(this.getNameOrTranslationByType(this.LIVING_AS_CHRISTIANS));
    translations.push(this.getNameOrTranslationByType(this.CONGREGATION_BIBLE_STUDY));
    return translations.filter(t => t).toString();
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

  getAssignTypeIdByType(type: AssignTypes) {
    return this.#assignTypes.find(at => at.type === type)?.id; //ToDo: For compatibility, ? must be removed on v6
  }

  /** Return an array of assign types ids */
  getAssignTypesIdsByRole() {
    const roles = this.configService.getRoles();
    const currentRoleId = this.configService.getCurrentRoleId();
    if (this.configService.isAdminRole()) {
      return this.getAssignTypes().map(at => at.id);
    } else if (roles) {
      return roles.find(r => r.id === currentRoleId).assignTypesId;
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
    this.#assignTypes = this.#assignTypes.filter(b => b.id !== id);
    //save assignTypes
    return this.saveAssignTypesToFile();
  }

  // prayer - As we understand assign types are related
  isOfTypePrayer(type: AssignTypes): boolean {
    return [this.INITIAL_PRAYER, this.ENDING_PRAYER].includes(type);
  }

  // prayer - As we understand assign types are related
  getTypesForPrayer(): AssignTypes[] {
    return [this.INITIAL_PRAYER, this.ENDING_PRAYER];
  }

  // school - As we understand assign types are related
  isOfTypeSchoolAssignTypes(type: AssignTypes): boolean {
    return [
      this.BIBLE_READING,
      this.INITIAL_CALL,
      this.RETURN_VISIT,
      this.TALK,
      this.BIBLE_STUDY,
      this.EXPLAIN_BELIEFS,
      this.ANALYSIS_AUDIENCE,
      this.INTEREST_IN_OTHERS //ToDo: For compatibility, must be removed on v6
    ].includes(type);
  }

  // school - As we understand assign types are related
  getTypesForSchoolAssignTypes(): AssignTypes[] {
    return [
      this.INTEREST_IN_OTHERS,
      this.BIBLE_READING,
      this.INITIAL_CALL,
      this.RETURN_VISIT,
      this.TALK,
      this.BIBLE_STUDY,
      this.EXPLAIN_BELIEFS,
      this.ANALYSIS_AUDIENCE
      //ToDo: For compatibility, must be removed on v6
    ];
  }

  // treasures and others - As we understand assign types are related
  isOfTypeTreasuresAndOthers(type: AssignTypes): boolean {
    return [
      this.TREASURES,
      this.SPIRITUAL_GEMS,
      this.LIVING_AS_CHRISTIANS,
      this.CONGREGATION_BIBLE_STUDY
    ].includes(type);
  }

  // treasures and others - As we understand assign types are related
  getTypesForTreasuresAndOthers(): AssignTypes[] {
    return [
      this.TREASURES,
      this.SPIRITUAL_GEMS,
      this.LIVING_AS_CHRISTIANS,
      this.CONGREGATION_BIBLE_STUDY
    ];
  }
}
