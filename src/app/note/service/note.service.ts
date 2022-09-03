import { NoteInterface } from "app/note/model/note.model";
import { APP_CONFIG } from "environments/environment";
import * as fs from "fs-extra";
import { nanoid } from "nanoid/non-secure";

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class NoteService {
  //where the file is depending on the context
  path: string = APP_CONFIG.production
    ? //__dirname is where the .js file exists
      __dirname + "/assets/source/note.json"
    : "./assets/source/note.json";

  //The array of notes in memory
  #notes: NoteInterface[] = undefined;
  //The map of notes for look up of by id
  #notesMap: Map<string, NoteInterface> = new Map();
  //flag to indicate that notes file has changed
  hasChanged = true;

  constructor() {}

  /**
   *
   * @returns NoteInterface[] the array of notes
   */
  getNotes(deepClone = false): NoteInterface[] {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#notes) : this.#notes;
    }
    this.hasChanged = false;
    this.#notes = fs.readJSONSync(this.path);
    for (const note of this.#notes) {
      this.#notesMap.set(note.id, note);
    }
    return deepClone ? structuredClone(this.#notes) : this.#notes;
  }

  /**
   *
   * @returns true if notes are saved to disk or false
   */
  saveNotesToFile(): boolean {
    //Write notes back to file
    fs.writeJson(this.path, this.#notes);
    return true;
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
    this.#notesMap.set(note.id, note);
    //save notes with the new note
    return this.saveNotesToFile();
  }

  /**
   *
   * @param id the id of the note to search for
   * @returns the note that is ALWAYS found
   */
  getNote(id: string): NoteInterface {
    return this.#notesMap.get(id);
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
        this.#notesMap.set(note.id, note);
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
    this.#notesMap.delete(id);
    //save notes
    return this.saveNotesToFile();
  }
}
