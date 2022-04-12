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
  fs: typeof fs;
  //where the file is depending on the context
  path: string;

  //The array of notes in memory
  notes: NoteInterface[];
  //flag to indicate that notes file has changed
  hasChanged: boolean;

  constructor(electronService: ElectronService) {
    this.fs = electronService.remote.require("fs-extra");

    this.path = APP_CONFIG.production
      ? //__dirname is where the .js file exists
        __dirname + "./assets/source/note.json"
      : "./assets/source/note.json";

    this.notes = [];

    this.hasChanged = false;
  }

  /**
   * Check if notes file exists, if not creates it and populates with initial array, then hasChanged is marked.
   */
  async ensureNoteFile() {
    const exists = await this.fs.pathExists(this.path);
    if (!exists) {
      //Create file
      await this.fs.ensureFile(this.path);
      //Put initial array
      await this.fs.writeJson(this.path, []);

      this.hasChanged = true;
    }
  }

  /**
   *
   * @returns NoteInterface[] the array of notes or null
   */
  async getNotes(): Promise<NoteInterface[]> {
    try {
      //Read notes file if hasChanged or initial read
      if (this.hasChanged || !this.notes.length) {
        const notes: NoteInterface[] = await this.fs.readJson(this.path);
        //Populate array in memory
        this.notes = notes;
        //clear flag
        this.hasChanged = false;
      }
      //return in memory notes
      return this.notes;
    } catch (err) {
      console.error("getNotes", err);
      return null;
    }
  }

  /**
   *
   * @returns true if notes are saved to disk or false
   */
  async saveNotesToFile(): Promise<boolean> {
    try {
      //Write notes back to file
      await this.fs.writeJson(this.path, this.notes);
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
  async createNote(note: NoteInterface): Promise<boolean> {
    //Generate id for the note
    note.id = nanoid();
    //add note to notes
    this.notes.push(note);
    //save notes with the new note
    return await this.saveNotesToFile();
  }

  /**
   *
   * @param id the id of the note to search for
   * @returns the note that is ALWAYS found
   */
  async getNote(id: string): Promise<NoteInterface> {
    //Preventive maybe this func is called outside note view
    if (!this.notes.length) {
      await this.getNotes();
    }
    //search note
    for (const note of this.notes) {
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
  async updateNote(note: NoteInterface): Promise<boolean> {
    //update note
    for (let i = 0; i < this.notes.length; i++) {
      if (this.notes[i].id === note.id) {
        this.notes[i] = note;
        //save notes with the updated note
        return await this.saveNotesToFile();
      }
    }
    return false;
  }

  /**
   *
   * @param note the note to delete
   * @returns true if note is deleted and saved false otherwise
   */
  async deleteNote(id: string): Promise<boolean> {
    //delete note
    this.notes = this.notes.filter((b) => b.id !== id);
    //save notes
    return await this.saveNotesToFile();
  }
}
