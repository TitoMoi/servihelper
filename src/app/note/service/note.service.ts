import { Injectable } from "@angular/core";
import { APP_CONFIG } from "environments/environment";
import { NoteInterface } from "app/note/model/note.model";
import * as fs from "fs-extra";
import { ElectronService } from "app/services/electron.service";
import { nanoid } from "nanoid/non-secure";

@Injectable({
  providedIn: "root",
})
export class NoteService {
  //fs-extra api
  fs: typeof fs = this.electronService.remote.require("fs-extra");
  //where the file is depending on the context
  path: string = APP_CONFIG.production
    ? //__dirname is where the .js file exists
      __dirname + "./assets/source/note.json"
    : "./assets/source/note.json";

  //The array of notes in memory
  #notes: NoteInterface[] = undefined;
  //flag to indicate that notes file has changed
  hasChanged: boolean = true;

  constructor(private electronService: ElectronService) {}

  /**
   *
   * @returns NoteInterface[] the array of notes
   */
  getNotes(deepClone = false): NoteInterface[] {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#notes) : this.#notes;
    }
    this.hasChanged = false;
    this.#notes = this.fs.readJSONSync(this.path);
    return deepClone ? structuredClone(this.#notes) : this.#notes;
  }

  /**
   *
   * @returns true if notes are saved to disk or false
   */
  saveNotesToFile(): boolean {
    try {
      //Write notes back to file
      this.fs.writeJson(this.path, this.#notes);
      //Flag
      this.hasChanged = true;
      return true;
    } catch (err) {
      console.error("saveNotes", err);
      return false;
    }
  }

  /**
   *
   * @param note the note to create
   * @returns true if note is saved false if not
   */
  createNote(note: NoteInterface): boolean {
    //Generate id for the note
    note.id = nanoid();
    //add note to notes
    this.#notes.push(note);
    //save notes with the new note
    return this.saveNotesToFile();
  }

  /**
   *
   * @param id the id of the note to search for
   * @returns the note that is ALWAYS found
   */
  getNote(id: string): NoteInterface {
    //Preventive maybe this func is called outside note view
    if (!this.#notes.length) {
      this.getNotes();
    }
    //search note
    for (const note of this.#notes) {
      if (note.id === id) {
        return note;
      }
    }
  }

  /**
   *
   * @param note the note to update
   * @returns true if note is updated and saved false otherwise
   */
  updateNote(note: NoteInterface): boolean {
    //update note
    for (let i = 0; i < this.#notes.length; i++) {
      if (this.#notes[i].id === note.id) {
        this.#notes[i] = note;
        //save notes with the updated note
        return this.saveNotesToFile();
      }
    }
    return false;
  }

  /**
   *
   * @param note the note to delete
   * @returns true if note is deleted and saved false otherwise
   */
  deleteNote(id: string): boolean {
    //delete note
    this.#notes = this.#notes.filter((b) => b.id !== id);
    //save notes
    return this.saveNotesToFile();
  }
}
