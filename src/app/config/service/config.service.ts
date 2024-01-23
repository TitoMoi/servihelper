import { ConfigInterface, ConfigOptionsType } from "app/config/model/config.model";
import { APP_CONFIG } from "environments/environment";
import { readJSONSync, writeJSONSync } from "fs-extra";

import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, distinctUntilChanged, map } from "rxjs";
import { RoleInterface } from "app/roles/model/role.model";
import { nanoid } from "nanoid";
import path from "path";
import { OnlineInterface } from "app/online/model/online.model";

import * as os from "os";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  //nanoId max id characters https://zelark.github.io/nano-id-cc/
  nanoMaxCharId = 10;

  //The user home
  homeDir = os.homedir();

  //Administrator key
  administratorKey = "administrator";

  //Json Filenames
  assignmentsFilename = "assignment.gz";
  notesFilename = "note.json";
  participantsFilename = "participant.json";
  assignTypesFilename = "assignType.json";
  roomsFilename = "room.json";
  configFilename = "config.json";
  onlineFilename = "online.json";
  lockFilename = "lock.json";
  migrationFilename = "migration.json";
  sheetTitleFilename = "sheetTitle.json";
  publicThemeFilename = "publicTheme.json";
  territoriesFilename = "territory.gz";
  territoryGroupsFilename = "territoryGroup.gz";
  polygonsFilename = "polygons.gz";

  //These file paths are not affected by the online
  /** Where the file is depending on the context__dirname is where the .js file exists */
  assetsFilesPath = APP_CONFIG.production ? path.join(__dirname, "assets") : "assets";
  iconsFilesPath = path.join(this.assetsFilesPath, "icons");
  templatesFilesPath = path.join(this.assetsFilesPath, "templates");
  backupPath = path.join(this.assetsFilesPath, "backup", "source");
  //This source is always offline
  onlinePath = path.join(this.assetsFilesPath, "source", this.onlineFilename);
  /**Also, these other path location below are prepared when the config file is loaded */
  sourceFilesPath;
  //The inner files of source folder
  configPath;
  lockPath;
  assignmentsPath;
  notesPath;
  participantsPath;
  migrationPath;
  assignTypesPath;
  roomsPath;
  sheetTitlePath;
  publicThemePath;
  territoriesPath;
  terrImagesPath;
  territoryGroupsPath;
  polygonsPath;

  // Flag to indicate that config file has changed
  hasChanged = true;

  private configSubject$: BehaviorSubject<ConfigInterface> = new BehaviorSubject(undefined);
  /**
   * Like the private inner config object but public and observable
   */
  config$: Observable<ConfigInterface> = this.configSubject$.asObservable();
  // The config in memory object
  #config: ConfigInterface = undefined;

  //Emits when the role changes
  role$: Observable<string> = this.config$.pipe(
    map((config) => config.role),
    distinctUntilChanged(),
  );

  // The current role id
  #role: string;

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
    this.#role = this.#config.role;
    this.configSubject$.next(this.#config);
    return this.#config;
  }

  prepareFilePaths(onlineConfig: OnlineInterface): boolean {
    if (onlineConfig.isOnline && onlineConfig.path) {
      this.sourceFilesPath = onlineConfig.path;
    } else {
      this.sourceFilesPath = path.join(this.assetsFilesPath, "source");
    }

    //PREPARE ALL THE REMAINING PATHS
    this.configPath = path.join(this.sourceFilesPath, this.configFilename);
    this.lockPath = path.join(this.sourceFilesPath, this.lockFilename);
    this.assignmentsPath = path.join(this.sourceFilesPath, this.assignmentsFilename);
    this.notesPath = path.join(this.sourceFilesPath, this.notesFilename);
    this.participantsPath = path.join(this.sourceFilesPath, this.participantsFilename);
    this.migrationPath = path.join(this.sourceFilesPath, this.migrationFilename);
    this.assignTypesPath = path.join(this.sourceFilesPath, this.assignTypesFilename);
    this.roomsPath = path.join(this.sourceFilesPath, this.roomsFilename);
    this.sheetTitlePath = path.join(this.sourceFilesPath, this.sheetTitleFilename);
    this.publicThemePath = path.join(this.sourceFilesPath, this.publicThemeFilename);
    this.territoriesPath = path.join(this.sourceFilesPath, this.territoriesFilename);
    this.terrImagesPath = path.join(this.sourceFilesPath, "images"); //directory
    this.territoryGroupsPath = path.join(this.sourceFilesPath, this.territoryGroupsFilename);
    this.polygonsPath = path.join(this.sourceFilesPath, this.polygonsFilename);
    return true;
  }
  /**
   *
   * @returns true if configs are saved to disk or false
   */
  saveConfigToFile() {
    writeJSONSync(this.configPath, this.#config);
    this.hasChanged = true;
    //Notify public listeners
    this.#role = this.#config.role;
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
  updateConfigByKey(key: ConfigOptionsType, value) {
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

  getCurrentRoleId() {
    return this.#config.role;
  }

  isAdminRole() {
    return this.#role === "administrator";
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
