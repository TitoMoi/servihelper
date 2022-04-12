import { Injectable } from "@angular/core";
import { APP_CONFIG } from "environments/environment";
import { ConfigInterface } from "app/config/model/config.model";
import * as fs from "fs-extra";
import { ElectronService } from "app/services/electron.service";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  //fs-extra api
  fs: typeof fs;
  //where the file is depending on the context
  path: string;

  //The config in memory object
  config: ConfigInterface;
  //flag to indicate that config file has changed
  hasChanged: boolean;

  constructor(electronService: ElectronService) {
    this.fs = electronService.remote.require("fs-extra");

    this.path = APP_CONFIG.production
      ? //__dirname is where the .js file exists
        __dirname + "./assets/source/config.json"
      : "./assets/source/config.json";

    this.config = {};

    this.hasChanged = false;
  }

  /**
   * Check if file exists, if not then creates the file and populates with default values.
   * @returns boolean
   */
  async ensureConfigFile() {
    const exists = await this.fs.pathExists(this.path);
    if (!exists) {
      //Create file
      await this.fs.ensureFile(this.path);

      await this.saveDefaultConfigOptions();
    }
    return true;
  }

  /**
   * Save default config options and set hasChanged
   */
  async saveDefaultConfigOptions() {
    //create default object
    const defaultOptions: ConfigInterface = {
      lang: "en",
      firstDayOfWeek: 1, //1 = Monday
      assignmentHeaderTitle: "",
    };
    await this.fs.writeJson(this.path, defaultOptions);

    this.hasChanged = true;
  }

  /**
   *
   * @returns ConfigInterface the config or null
   */
  async getConfig(): Promise<ConfigInterface> {
    try {
      //Read configs file if hasChanged or initial read
      if (this.hasChanged || !this.config) {
        // //Populate object in memory
        this.config = await this.fs.readJson(this.path);
        //clear flag
        this.hasChanged = false;
      }
      //return in memory configs
      return this.config;
    } catch (err) {
      console.error("getConfigs", err);
      return null;
    }
  }

  /**
   *
   * @returns true if configs are saved to disk or false
   */
  async saveConfigToFile(): Promise<boolean> {
    try {
      //Write configs back to file
      await this.fs.writeJson(this.path, this.config);
      //Flag
      this.hasChanged = true;
      return true;
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
    this.config = config;
    //save configs with the updated config
    const res = await this.saveConfigToFile();
    return res;
  }
}
