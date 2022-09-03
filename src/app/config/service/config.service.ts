import {
  ConfigInterface,
  ConfigOptionsType,
} from "app/config/model/config.model";
import { APP_CONFIG } from "environments/environment";
import * as fs from "fs-extra";

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  // Where the file is depending on the context
  path: string = APP_CONFIG.production
    ? //__dirname is where the .js file exists
      __dirname + "/assets/source/config.json"
    : "./assets/source/config.json";
  // The config in memory object
  #config: ConfigInterface = undefined;
  // Flag to indicate that config file has changed
  hasChanged = true;

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
    this.#config = fs.readJSONSync(this.path);
    return this.#config;
  }
  /**
   *
   * @returns true if configs are saved to disk or false
   */
  saveConfigToFile(): boolean {
    fs.writeJson(this.path, this.#config);
    this.hasChanged = true;
    return true;
  }

  /**
   *
   * @param config the config to update
   * @returns true if config is updated and saved false otherwise
   */
  updateConfig(config: ConfigInterface): boolean {
    //update config
    this.#config = config;
    //save configs with the updated config
    const res = this.saveConfigToFile();
    return res;
  }

  /**
   *
   * @param key the key to update
   * @param value the value of the key to update
   * @returns true if config is updated and saved false otherwise
   */
  updateConfigByKey(key: ConfigOptionsType, value: any): boolean {
    this.#config[key as string] = value;
    //save configs with the updated config
    const res = this.saveConfigToFile();
    return res;
  }
}
