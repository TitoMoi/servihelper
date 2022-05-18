import { Injectable } from "@angular/core";
import { APP_CONFIG } from "environments/environment";
import { nanoid } from "nanoid/non-secure";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import * as fs from "fs-extra";
import { ElectronService } from "app/services/electron.service";

@Injectable({
  providedIn: "root",
})
export class AssignmentService {
  //fs-extra api
  fs: typeof fs = this.electronService.remote.require("fs-extra");
  //where the file is depending on the context
  path: string;
  //The array of assignments in memory
  #assignments: AssignmentInterface[] = undefined;
  //flag to indicate that assignments file has changed
  hasChanged: boolean = true;

  constructor(private electronService: ElectronService) {
    this.path = APP_CONFIG.production
      ? //__dirname is where the .js file exists
        __dirname + "./assets/source/assignment.json"
      : "./assets/source/assignment.json";
  }

  /**
   *
   * @returns AssignmentInterface[] the array of assignments or null
   */
  getAssignments(): AssignmentInterface[] {
    if (!this.hasChanged) {
      return this.#assignments;
    }
    this.hasChanged = false;
    this.#assignments = this.fs.readJSONSync(this.path);
    return this.#assignments;
  }

  /**
   *
   * @returns save in memory assignments to file, true if assignments are saved to disk or false if some error happens.
   */
  async saveAssignmentsToFile(): Promise<boolean> {
    try {
      //Write assignments back to file
      await this.fs.writeJson(this.path, this.#assignments);
      //Flag
      this.hasChanged = true;
      return true;
    } catch (err) {
      console.error("saveAssignments", err);
      return false;
    }
  }

  /**
   *
   * @param assignment the assignment to create
   * @returns true if assignment is created and saved, false if not
   */
  async createAssignment(assignment: AssignmentInterface): Promise<boolean> {
    //Generate id for the assignment
    assignment.id = nanoid();
    //add assignment to assignments
    this.#assignments.push(assignment);

    //ORDER THE ASSIGNMENTS BY MOST RECENT DATE
    this.#assignments = this.#assignments.sort(this.sortAssignmentsByDate);

    //save assignments with the new assignment
    return await this.saveAssignmentsToFile();
  }

  /**
   *
   * @param a AssignmentInterface the assignment A
   * @param b AssignmentInterface the assignment B
   * @returns number the 1,-1,0 logic for the sort method
   */
  sortAssignmentsByDate(
    a: AssignmentInterface,
    b: AssignmentInterface
  ): number {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA < dateB) {
      return 1;
    }
    if (dateA > dateB) {
      return -1;
    }
    return 0;
  }

  /**
   *
   * @param id the id of the assignment to search for
   * @returns the assignment that is ALWAYS found
   */
  async getAssignment(id: string): Promise<AssignmentInterface> {
    //search assignment
    for (const assignment of this.#assignments) {
      if (assignment.id === id) {
        return assignment;
      }
    }
  }

  /**
   *
   * @param assignment the assignment to update
   * @returns true if assignment is updated and saved false otherwise
   */
  async updateAssignment(assignment: AssignmentInterface): Promise<boolean> {
    //update assignment
    for (let i = 0; i < this.#assignments.length; i++) {
      if (this.#assignments[i].id === assignment.id) {
        this.#assignments[i] = assignment;
        //save assignments with the updated assignment
        return await this.saveAssignmentsToFile();
      }
    }
    return false;
  }

  /**
   *
   * @param assignment the assignment to delete
   * @returns true if assignment is deleted and saved false otherwise
   */
  async deleteAssignment(id: string): Promise<boolean> {
    //delete assignment
    this.#assignments = this.#assignments.filter((b) => b.id !== id);
    //save assignments
    return await this.saveAssignmentsToFile();
  }

  /**
   *
   * @param id the id of the participant to delete assignments by.
   * @returns true if assignment is deleted and saved false otherwise
   */
  async deleteAssignmentsByParticipant(id: string): Promise<boolean> {
    //Preventive if being called outside
    await this.checkAssignments();
    //delete assignments of the participant being the principal
    this.#assignments = this.#assignments.filter((a) => a.principal !== id);

    //Reset to undefined in assistant
    for (const assignment of this.#assignments) {
      if (assignment.assistant === id) assignment.assistant = undefined;
    }

    //save assignments
    return await this.saveAssignmentsToFile();
  }

  /**
   *
   * @param participantId the participant id to search assignments
   * @returns the assignments of the participant
   */
  findAssignmentsByParticipantId(participantId: string): AssignmentInterface[] {
    const assignments = this.#assignments.filter(
      (assignment) =>
        assignment.principal === participantId ||
        assignment.assistant === participantId
    );
    return assignments;
  }

  /**
   *
   * @param participantId the participant id to search assignments
   * @returns the assignments of the participant
   */
  findPrincipalAssignmentsByParticipantId(
    participantId: string
  ): AssignmentInterface[] {
    const assignments = this.#assignments.filter(
      (assignment) => assignment.principal === participantId
    );
    return assignments;
  }

  /**
   *
   * @param participantId the participant id to search assignments
   * @returns the assignments of the participant
   */
  findAssistantAssignmentsByParticipantId(
    participantId: string
  ): AssignmentInterface[] {
    const assignments = this.#assignments.filter(
      (assignment) => assignment.assistant === participantId
    );
    return assignments;
  }

  /**
   *
   * @param id the id of the room to delete assignments by.
   * @returns true if assignment is deleted and saved false otherwise
   */
  async deleteAssignmentsByRoom(id: string): Promise<boolean> {
    //Preventive if being called outside
    await this.checkAssignments();
    //delete assignments
    this.#assignments = this.#assignments.filter((a) => a.room !== id);
    //save assignments
    return await this.saveAssignmentsToFile();
  }

  /**
   *
   * @param id the id of the assignType to delete assignments by.
   * @returns true if assignment is deleted and saved false otherwise
   */
  async deleteAssignmentsByAssignType(id: string): Promise<boolean> {
    //Preventive if being called outside
    await this.checkAssignments();
    //delete assignments
    this.#assignments = this.#assignments.filter((a) => a.assignType !== id);
    //save assignments
    return await this.saveAssignmentsToFile();
  }

  /**
   *
   * @param id the id of the note to delete assignments by.
   * @returns true if assignment is deleted and saved false otherwise
   */
  async resetAssignmentsByNote(id: string): Promise<boolean> {
    //Preventive if being called outside
    await this.checkAssignments();
    //reset assignments note
    for (const assignment of this.#assignments) {
      if (assignment.footerNote === id) assignment.footerNote = undefined;
    }
    //save assignments
    return await this.saveAssignmentsToFile();
  }

  async checkAssignments() {
    if (!this.#assignments.length) {
      await this.getAssignments();
    }
  }
}
