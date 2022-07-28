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
  path: string = APP_CONFIG.production
    ? //__dirname is where the .js file exists
      __dirname + "/assets/source/assignment.json"
    : "./assets/source/assignment.json";
  //The array of assignments in memory
  #assignments: AssignmentInterface[] = undefined;
  //flag to indicate that assignments file has changed
  hasChanged = true;

  constructor(private electronService: ElectronService) {}

  /**
   * @param deepClone if should be cloned or only return reference
   * @returns AssignmentInterface[] the array of assignments or null
   */
  getAssignments(deepClone = false): AssignmentInterface[] {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#assignments) : this.#assignments;
    }
    this.hasChanged = false;
    this.#assignments = this.fs.readJSONSync(this.path);
    return deepClone ? structuredClone(this.#assignments) : this.#assignments;
  }

  /**
   *
   * @returns save in memory assignments to file, true if assignments are saved to disk or false if some error happens.
   * performance: dont mark flag hasChanged to true because this.assignments in memory is already updated
   */
  saveAssignmentsToFile(): boolean {
    //Write assignments back to file
    this.fs.writeJson(this.path, this.#assignments);
    return true;
  }

  /**
   *
   * @param assignment the assignment to create
   * @returns true if assignment is created and saved, false if not
   */
  createAssignment(assignment: AssignmentInterface): boolean {
    //Generate id for the assignment
    assignment.id = nanoid();
    //add assignment to assignments
    this.#assignments.push(assignment);

    //ORDER THE ASSIGNMENTS BY MOST RECENT DATE
    this.#assignments = this.#assignments.sort(this.sortAssignmentsByDateDesc);

    //save assignments with the new assignment
    return this.saveAssignmentsToFile();
  }

  /**
   *
   * @param a AssignmentInterface the assignment A
   * @param b AssignmentInterface the assignment B
   * @returns number the 1,-1,0 logic for the sort method
   */
  sortAssignmentsByDateDesc(
    a: AssignmentInterface,
    b: AssignmentInterface
  ): number {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
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
   * @param a AssignmentInterface the assignment A
   * @param b AssignmentInterface the assignment B
   * @returns number the 1,-1,0 logic for the sort method
   */
  sortAssignmentsByDateAsc(
    a: AssignmentInterface,
    b: AssignmentInterface
  ): number {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA > dateB) {
      return 1;
    }
    if (dateA < dateB) {
      return -1;
    }
    return 0;
  }

  /**
   *
   * @param id the id of the assignment to search for
   * @returns the assignment that is ALWAYS found
   */
  getAssignment(id: string): AssignmentInterface {
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
  updateAssignment(assignment: AssignmentInterface): boolean {
    //update assignment
    for (let i = 0; i < this.#assignments.length; i++) {
      if (this.#assignments[i].id === assignment.id) {
        this.#assignments[i] = assignment;
        //save assignments with the updated assignment
        return this.saveAssignmentsToFile();
      }
    }
    return false;
  }

  /**
   *
   * @param assignment the assignment to delete
   * @returns true if assignment is deleted and saved false otherwise
   */
  deleteAssignment(id: string): boolean {
    //delete assignment
    this.#assignments = this.#assignments.filter((a) => a.id !== id);
    //save assignments
    return this.saveAssignmentsToFile();
  }

  /**
   *
   * @param id the id of the participant to delete assignments by.
   * @returns true if assignment is deleted and saved false otherwise
   */
  deleteAssignmentsByParticipant(id: string): boolean {
    //Preventive if being called outside
    this.checkAssignments();
    //delete assignments of the participant being the principal
    this.#assignments = this.#assignments.filter((a) => a.principal !== id);

    //Reset to undefined in assistant
    for (const assignment of this.#assignments) {
      if (assignment.assistant === id) assignment.assistant = undefined;
    }

    //save assignments
    return this.saveAssignmentsToFile();
  }

  /**
   *
   * @param id the id of the room to delete assignments by.
   * @returns true if assignment is deleted and saved false otherwise
   */
  deleteAssignmentsByRoom(id: string): boolean {
    //Preventive if being called outside
    this.checkAssignments();
    //delete assignments
    this.#assignments = this.#assignments.filter((a) => a.room !== id);
    //save assignments
    return this.saveAssignmentsToFile();
  }

  /**
   *
   * @param id the id of the assignType to delete assignments by.
   * @returns true if assignment is deleted and saved false otherwise
   */
  deleteAssignmentsByAssignType(id: string): boolean {
    //Preventive if being called outside
    this.checkAssignments();
    //delete assignments
    this.#assignments = this.#assignments.filter((a) => a.assignType !== id);
    //save assignments
    return this.saveAssignmentsToFile();
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
   * @param id the id of the note to delete assignments by.
   * @returns true if assignment is deleted and saved false otherwise
   */
  resetAssignmentsByNote(id: string): boolean {
    //Preventive if being called outside
    this.checkAssignments();
    //reset assignments note
    for (const assignment of this.#assignments) {
      if (assignment.footerNote === id) assignment.footerNote = undefined;
    }
    //save assignments
    return this.saveAssignmentsToFile();
  }

  checkAssignments() {
    if (!this.#assignments.length) {
      this.getAssignments();
    }
  }
}
