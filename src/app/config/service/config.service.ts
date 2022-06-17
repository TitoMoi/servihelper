import { Injectable } from "@angular/core";
import {
  ConfigInterface,
  ConfigOptionsType,
} from "app/config/model/config.model";
import { ElectronService } from "app/services/electron.service";
import { APP_CONFIG } from "environments/environment";
import * as fs from "fs-extra";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  // Filesystem api
  fs: typeof fs = this.electronService.remote.require("fs-extra");
  // Where the file is depending on the context
  path: string = APP_CONFIG.production
    ? //__dirname is where the .js file exists
      __dirname + "/assets/source/config.json"
    : "./assets/source/config.json";
  // The config in memory object
  #config: ConfigInterface = undefined;
  // Flag to indicate that config file has changed
  hasChanged: boolean = true;

  constructor(private electronService: ElectronService) {}

  /**
   *
   * @returns ConfigInterface
   */
  getConfig(): ConfigInterface {
    if (!this.hasChanged) {
      return this.#config;
    }
    this.hasChanged = false;
    this.#config = this.fs.readJSONSync(this.path);
    return this.#config;
  }

  /**
   * Check that has all the properties
   * @returns true if exist, else throws error
   */
  allPropertiesExist() {
    if (
      !("assignmentHeaderTitle" in this.#config) ||
      !("firstDayOfWeek" in this.#config) ||
      !("lang" in this.#config) ||
      !("defaultFooterNoteId" in this.#config)
    ) {
      throw new Error("config file missing key properties");
    }
    return true;
  }
  /**
   *
   * @returns true if configs are saved to disk or false
   */
  saveConfigToFile(): boolean {
    if (this.allPropertiesExist()) {
      this.fs.writeJson(this.path, this.#config);
      this.hasChanged = true;
      return true;
    }
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
