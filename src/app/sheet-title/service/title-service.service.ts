import { Injectable } from "@angular/core";
import { SheetTitleInterface } from "../model/sheet-title.model";
import { readJSONSync, writeJson } from "fs-extra";
import { nanoid } from "nanoid/non-secure";

@Injectable({
  providedIn: "root",
})
export class TitleServiceService {
  //flag to indicate that sheet title file has changed
  hasChanged = true;
  //The array of sheet titles in memory
  #titles: SheetTitleInterface[] = [];

  constructor(private configService: ConfigService) {}

  /**
   *
   * @param id the id of the sheet title to search for
   * @returns the sheet title that is ALWAYS found
   */
  getTitle(id: string): SheetTitleInterface {
    const title = this.#titles.find((t) => t.id === id);
    if (title === undefined) throw new Error("title undefined");
    return title;
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
   * @returns true if sheet itles is updated and saved false otherwise
   */
  updateRoom(title: SheetTitleInterface): boolean {
    //update room
    for (let i = 0; i < this.#titles.length; i++) {
      if (this.#titles[i].id === title.id) {
        this.#titles[i] = title;
        //save sheet titles with the updated room
        return this.saveSheetTitlesToFile();
      }
    }
    return false;
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
