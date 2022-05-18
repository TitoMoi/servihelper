import { Injectable } from "@angular/core";
import { ConfigInterface } from "app/config/model/config.model";
import { ElectronService } from "app/services/electron.service";
import { APP_CONFIG } from "environments/environment";
import * as fs from "fs-extra";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  // Filesystem api
  fs: typeof fs;
  // Where the file is depending on the context
  path: string;
  // The config in memory object
  #config: ConfigInterface = undefined;
  // Flag to indicate that config file has changed
  hasChanged: boolean = true;

  constructor(electronService: ElectronService) {
    this.fs = electronService.remote.require("fs-extra");

    this.path = APP_CONFIG.production
      ? //__dirname is where the .js file exists
        __dirname + "./assets/source/config.json"
      : "./assets/source/config.json";
  }

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
   *
   * @returns true if configs are saved to disk or false
   */
  async saveConfigToFile(): Promise<boolean> {
    try {
      //Security check that has all the properties
      if (
        "assignmentHeaderTitle" in this.#config &&
        "firstDayOfWeek" in this.#config &&
        "lang" in this.#config
      ) {
        if (this.#config)
          //Write configs back to file
          await this.fs.writeJson(this.path, this.#config);
        //Flag
        this.hasChanged = true;
        return true;
      } else {
        throw new Error("config file missing properties");
      }
    } catch (err) {
      console.error("saveConfig", err);
      return false;
    }
  }

  /**
   *
   * @param config the config to update
   * @returns true if config is updated and saved false otherwise
   */
  async updateConfig(config: ConfigInterface): Promise<boolean> {
    //update config
    this.#config = config;
    //save configs with the updated config
    const res = await this.saveConfigToFile();
    return res;
  }

  /**
   *
   * @param key the key to update
   * @param value the value of the key to update
   * @returns true if config is updated and saved false otherwise
   */
  async updateConfigByKey(key: string, value: any): Promise<boolean> {
    //update config
    this.#config[key] = value;
    //save configs with the updated config
    const res = await this.saveConfigToFile();
    return res;
  }
}
