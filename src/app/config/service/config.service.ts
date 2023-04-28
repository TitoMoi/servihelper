import { ConfigInterface, ConfigOptionsType } from "app/config/model/config.model";
import { APP_CONFIG } from "environments/environment";
import { readJSONSync, writeJSONSync } from "fs-extra";

import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { RoleInterface } from "app/roles/model/role.model";
import { nanoid } from "nanoid";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  //Administrator key
  administratorKey = "administrator";

  // Where the file is depending on the context
  path: string = APP_CONFIG.production
    ? //__dirname is where the .js file exists
      __dirname + "/assets/source/config.json"
    : "./assets/source/config.json";
  // Flag to indicate that config file has changed
  hasChanged = true;

  configSubject$: BehaviorSubject<ConfigInterface> = new BehaviorSubject(undefined);
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
    this.#config = readJSONSync(this.path);
    this.configSubject$.next(this.#config);
    return this.#config;
  }
  /**
   *
   * @returns true if configs are saved to disk or false
   */
  saveConfigToFile() {
    writeJSONSync(this.path, this.#config);
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
    role.id = nanoid();
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
