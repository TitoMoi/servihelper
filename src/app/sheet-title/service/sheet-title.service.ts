import { Injectable } from "@angular/core";
import { SheetTitleInterface } from "../model/sheet-title.model";
import { readJSONSync, writeJson } from "fs-extra";
import { nanoid } from "nanoid/non-secure";

import { ConfigService } from "app/config/service/config.service";

@Injectable({
  providedIn: "root",
})
export class SheetTitleService {
  //flag to indicate that sheet title file has changed
  hasChanged = true;
  //The array of sheet titles in memory
  #titles: SheetTitleInterface[] = [];

  constructor(private configService: ConfigService) {}

  /**
   *
   * @param id the id of the sheet title to search for
   * @returns the sheet title or undefined
   */
  getTitle(id: string): SheetTitleInterface | undefined {
    return this.#titles.find((t) => t.id === id);
  }

  /**
   *
   * @returns SheetTitleInterface[] the array of titles
   */
  getTitles(deepClone = false): SheetTitleInterface[] {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#titles) : this.#titles;
    }
    this.hasChanged = false;
    this.#titles = readJSONSync(this.configService.sheetTitlePath);

    return deepClone ? structuredClone(this.#titles) : this.#titles;
  }

  /**
   *
   * @param title the sheet title to create
   * @returns the id of the new sheet title
   */
  createTitle(title: SheetTitleInterface): string {
    //Generate id for the sheet title
    title.id = nanoid(this.configService.nanoMaxCharId);
    //add sheet title to sheet titles
    this.#titles.push(title);

    //save sheet titles with the new sheet title
    this.saveSheetTitlesToFile();

    return title.id;
  }

  /**
   *
   * @param title the sheet title to update
   * @returns true if sheet title is updated and saved false otherwise
   */
  updateTitle(title: SheetTitleInterface): boolean {
    //update sheet title
    for (let i = 0; i < this.#titles.length; i++) {
      if (this.#titles[i].id === title.id) {
        this.#titles[i] = title;
        //save sheet titles with the updated sheet title
        return this.saveSheetTitlesToFile();
      }
    }
    return false;
  }
  /**
   *
   * @param room the sheet title id to delete
   * @returns true if sheet title is deleted and saved false otherwise
   */
  deleteSheetTitle(id: string): boolean {
    this.#titles = this.#titles.filter((t) => t.id !== id);

    //save titles
    return this.saveSheetTitlesToFile();
  }
  /**
   *
   * @returns true if sheet titles are saved to disk or false
   */
  saveSheetTitlesToFile(): boolean {
    //Write sheet titles back to file
    writeJson(this.configService.sheetTitlePath, this.#titles);
    return true;
  }
}
