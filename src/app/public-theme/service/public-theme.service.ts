import { Injectable, inject } from "@angular/core";
import { PublicThemeInterface } from "../model/public-theme.model";
import { readJSONSync, writeJson } from "fs-extra";
import { nanoid } from "nanoid/non-secure";

import { ConfigService } from "app/config/service/config.service";

@Injectable({
  providedIn: "root",
})
export class PublicThemeService {
  private configService = inject(ConfigService);

  //flag to indicate that public theme file has changed
  hasChanged = true;
  //The array of public themes in memory
  #publicThemes: PublicThemeInterface[] = [];

  /**
   *
   * @param id the id of the public theme to search for
   * @returns the public theme
   */
  getPublicTheme(id: string): PublicThemeInterface {
    return this.#publicThemes.find((t) => t.id === id)!;
  }

  /**
   *
   * @returns PublicThemeInterface[] the array of public themes
   */
  getPublicThemes(deepClone = false): PublicThemeInterface[] {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#publicThemes) : this.#publicThemes;
    }
    this.hasChanged = false;
    this.#publicThemes = readJSONSync(this.configService.publicThemePath);

    return deepClone ? structuredClone(this.#publicThemes) : this.#publicThemes;
  }

  /**
   *
   * @param publicTheme the public theme to create
   * @returns the id of the new public theme
   */
  createPublicTheme(publicTheme: PublicThemeInterface): string {
    //Generate id for the public theme
    publicTheme.id = nanoid(this.configService.nanoMaxCharId);
    //add public theme to public themes
    this.#publicThemes.push(publicTheme);
    //save public themes with the new public theme
    this.savePublicThemesToFile();

    return publicTheme.id;
  }

  /**
   *
   * @param publicTheme the public theme to update
   * @returns true if public theme is updated and saved false otherwise
   */
  updatePublicTheme(publicTheme: PublicThemeInterface): boolean {
    //update public theme
    for (let i = 0; i < this.#publicThemes.length; i++) {
      if (this.#publicThemes[i].id === publicTheme.id) {
        this.#publicThemes[i] = publicTheme;
        //save public themes with the updated public theme
        return this.savePublicThemesToFile();
      }
    }
    return false;
  }
  /**
   *
   * @param public theme the public theme id to delete
   * @returns true if public theme is deleted and saved false otherwise
   */
  deletePublicTheme(id: string): boolean {
    this.#publicThemes = this.#publicThemes.filter((t) => t.id !== id);

    //save public themes
    return this.savePublicThemesToFile();
  }
  /**
   *
   * @returns true if public themes are saved to disk or false
   */
  savePublicThemesToFile(): boolean {
    //Write public themes back to file
    writeJson(this.configService.publicThemePath, this.#publicThemes);
    return true;
  }
}
