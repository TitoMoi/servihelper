import { ConfigInterface, ConfigOptionsType } from "app/config/model/config.model";
import { APP_CONFIG } from "environments/environment";
import { readJSONSync, writeJSONSync } from "fs-extra";

import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { RoleInterface } from "app/roles/model/role.model";
import { nanoid } from "nanoid";
import path from "path";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  //nanoId max id characters https://zelark.github.io/nano-id-cc/
  nanoMaxCharId = 10;

  //Administrator key
  administratorKey = "administrator";

  sourceFilesPath = APP_CONFIG.production
    ? path.join(__dirname, "assets/source")
    : "assets/source";

  assignmentsFilename = "assignment.json";
  notesFilename = "note.json";
  participantsFilename = "participant.json";
  assignTypesFilename = "assignType.json";
  roomsFilename = "room.json";
  configFilename = "config.json";
  sheetTitleFilename = "sheetTitle.json";
  territoriesFilename = "territory.json";
  territoryGroupsFilename = "territoryGroup.json";
  polygonsFilename = "polygons.json";

  /** Where the file is depending on the context__dirname is where the .js file exists */
  configPath: string = APP_CONFIG.production
    ? path.join(this.sourceFilesPath, this.configFilename)
    : path.join("./", this.sourceFilesPath, this.configFilename);
  // Flag to indicate that config file has changed
  hasChanged = true;

  assignmentsPath = APP_CONFIG.production
    ? path.join(this.sourceFilesPath, this.assignmentsFilename)
    : path.join("./", this.sourceFilesPath, this.assignmentsFilename);

  notesPath = APP_CONFIG.production
    ? path.join(this.sourceFilesPath, this.notesFilename)
    : path.join("./", this.sourceFilesPath, this.notesFilename);

  participantsPath = APP_CONFIG.production
    ? path.join(this.sourceFilesPath, this.participantsFilename)
    : path.join("./", this.sourceFilesPath, this.participantsFilename);

  assignTypesPath = APP_CONFIG.production
    ? path.join(this.sourceFilesPath, this.assignTypesFilename)
    : path.join("./", this.sourceFilesPath, this.assignTypesFilename);

  roomsPath = APP_CONFIG.production
    ? path.join(this.sourceFilesPath, this.roomsFilename)
    : path.join("./", this.sourceFilesPath, this.roomsFilename);

  sheetTitlePath = APP_CONFIG.production
    ? path.join(this.sourceFilesPath, this.sheetTitleFilename)
    : path.join("./", this.sourceFilesPath, this.sheetTitleFilename);

  territoriesPath = APP_CONFIG.production
    ? path.join(this.sourceFilesPath, this.territoriesFilename)
    : path.join("./", this.sourceFilesPath, this.territoriesFilename);

  territoryGroupsPath = APP_CONFIG.production
    ? path.join(this.sourceFilesPath, this.territoryGroupsFilename)
    : path.join("./", this.sourceFilesPath, this.territoryGroupsFilename);

  polygonsPath = APP_CONFIG.production
    ? path.join(this.sourceFilesPath, this.polygonsFilename)
    : path.join("./", this.sourceFilesPath, this.polygonsFilename);

  private configSubject$: BehaviorSubject<ConfigInterface> = new BehaviorSubject(undefined);
  /**
   * Like the private inner config object but public and observable
   */
  config$: Observable<ConfigInterface> = this.configSubject$.asObservable();
  // The config in memory object
  #config: ConfigInterface = undefined;

  constructor() {}

  /**
   *
   * @returns ConfigInterface
   */
  getConfig(): ConfigInterface {
    if (!this.hasChanged) {
      return this.#config;
    }
    this.hasChanged = false;
    this.#config = readJSONSync(this.configPath);
    this.configSubject$.next(this.#config);
    return this.#config;
  }
  /**
   *
   * @returns true if configs are saved to disk or false
   */
  saveConfigToFile() {
    writeJSONSync(this.configPath, this.#config);
    this.hasChanged = true;
    //Notify public listeners
    this.configSubject$.next(this.#config);
  }

  /**
   *
   * @param config the config to update
   * @returns true if config is updated and saved false otherwise
   */
  updateConfig(config: ConfigInterface) {
    //update config
    this.#config = config;
    //save configs with the updated config
    this.saveConfigToFile();
  }

  /**
   *
   * @param key the key to update
   * @param value the value of the key to update
   * @returns true if config is updated and saved false otherwise
   */
  updateConfigByKey(key: ConfigOptionsType, value: any) {
    this.#config[key as string] = value;
    //save configs with the updated config
    this.saveConfigToFile();
  }

  getRoles() {
    return this.#config.roles;
  }

  getRole(id: string): RoleInterface {
    return this.#config.roles.find((role) => role.id === id);
  }

  getCurrentRole() {
    return this.#config.role;
  }

  addRole(role: RoleInterface) {
    role.id = nanoid(this.nanoMaxCharId);
    role.name = role.name.trim();
    this.#config.roles.push(role);
    this.saveConfigToFile();
  }

  updateRole(role: RoleInterface) {
    role.name = role.name.trim();
    const index = this.#config.roles.findIndex((r) => r.id === role.id);
    this.#config.roles[index] = role;
    this.saveConfigToFile();
  }

  deleteRole(id) {
    this.#config.roles = this.#config.roles.filter((role) => role.id !== id);
    this.saveConfigToFile();
  }

  setAdminRole() {
    this.#config.role = this.administratorKey;
    this.saveConfigToFile();
  }
}
