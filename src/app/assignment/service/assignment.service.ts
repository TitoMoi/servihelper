/* eslint-disable complexity */
import {
  AssignmentInterface,
  AssignmentOperationInterface,
  AssignmentTableInterface,
} from "app/assignment/model/assignment.model";
import { readFile, writeFile } from "fs-extra";
import { nanoid } from "nanoid/non-secure";

import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ConfigService } from "app/config/service/config.service";
import { LockService } from "app/lock/service/lock.service";
import { inflate, deflate } from "pako";
import { addDays, subDays } from "date-fns";

@Injectable({
  providedIn: "root",
})
export class AssignmentService {
  //flag to indicate that assignments file has changed
  hasChanged = true;
  //To track assignment create, update or delete
  assignment$: Subject<AssignmentOperationInterface> =
    new Subject<AssignmentOperationInterface>();
  //The array of assignments in memory
  #assignments: AssignmentInterface[] = [];
  //The map of assignments for look up of by id
  #assignmentsMap: Map<string, AssignmentInterface> = new Map();
  //The map of assignments for look up of by date
  #assignmentsByDateMap: Map<Date | string, AssignmentInterface[]> = new Map();

  constructor(
    private configService: ConfigService,
    private lockService: LockService,
  ) {}

  /**
   * @param deepClone if should be cloned or only return reference
   * @returns AssignmentInterface[] the array of assignments or null
   */
  async getAssignments(deepClone = false): Promise<AssignmentInterface[]> {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#assignments) : this.#assignments;
    }
    this.hasChanged = false;

    const assignContent = await readFile(this.configService.assignmentsPath);

    if (assignContent) {
      this.#assignments = JSON.parse(inflate(assignContent, { to: "string" }));

      //populate maps for first run
      for (const assignment of this.#assignments) {
        this.#assignmentsMap.set(assignment.id, assignment);

        this.addOrUpdateAssignmentToAssignmentByDateMap(assignment);
      }
    }

    return deepClone ? structuredClone(this.#assignments) : this.#assignments;
  }

  /**
   * @param date the date to return all the assignments, must be converted to ISO-8601
   * because saving as json uses internally DateTimeConverter for handling date time and save it
   * as string.
   * So, when we get something on runtime its a Date...and needs to be serialized to string, thats why
   * Map interface supports <Date | string, ...>
   * @returns an array of assignments by date
   */
  getAssignmentsByDate(date: Date): AssignmentInterface[] {
    const isoDate = new Date(date).toISOString();
    return this.#assignmentsByDateMap.get(isoDate) ?? [];
  }

  /** Returns the number of assignments for each day */
  getDateAndAssignmentsLength(): number[] {
    const dateAndAssignLength = [];
    for (const assignments of this.#assignmentsByDateMap.values()) {
      dateAndAssignLength.push(assignments.length);
    }
    return dateAndAssignLength;
  }

  /**
   * @param assignment that can be get from serialized json or runtime, if
   * from serialized json its ok, saves the key as string
   * if from runtime, date must be serialized first
   * so for no doubt, always check with serialized isoDate
   */
  addOrUpdateAssignmentToAssignmentByDateMap(assignment: AssignmentInterface) {
    const isoDate = new Date(assignment.date).toISOString();
    if (this.#assignmentsByDateMap.has(isoDate)) {
      const assignmentsByDate = this.#assignmentsByDateMap.get(isoDate);
      //create or update
      let isUpdate = false;
      for (let i = 0; i < assignmentsByDate.length; i++) {
        if (assignmentsByDate[i].id === assignment.id) {
          isUpdate = true;
          assignmentsByDate[i] = assignment;
          break;
        }
      }
      if (!isUpdate) {
        assignmentsByDate.push(assignment);
      }
      //After modify the array, return it to the map
      this.#assignmentsByDateMap.set(isoDate, assignmentsByDate);
    } else {
      this.#assignmentsByDateMap.set(isoDate, [assignment]);
    }
  }

  saveAssignmentsToFile() {
    //Write assignments back to file
    const gziped = deflate(JSON.stringify(this.#assignments), { to: "string" });
    writeFile(this.configService.assignmentsPath, gziped);
    //Notify the lock we are working
    this.lockService.updateTimestamp();
  }

  createMultipleAssignments(assignments: AssignmentInterface[]) {
    for (let assignment of assignments) {
      //Generate id for the assignment
      assignment.id = nanoid(this.configService.nanoMaxCharId);

      //Simulate we have saved and retrieved assignment, this is only for serialize Date and get an ISO string
      //This only happens on create, update respects the date and also delete.
      //We do this because we dont get again the assignments from file, they are in memory
      assignment = JSON.parse(JSON.stringify(assignment));
      //add assignment to assignments
      this.#assignments.push(assignment);
      this.#assignmentsMap.set(assignment.id, assignment);
      this.addOrUpdateAssignmentToAssignmentByDateMap(assignment);
    }
    //ORDER THE ASSIGNMENTS BY MOST RECENT DATE
    this.#assignments.sort(this.sortAssignmentsByDateDesc);
    //save assignments with the new assignment
    this.saveAssignmentsToFile();

    for (let assignment of assignments) {
      assignment = JSON.parse(JSON.stringify(assignment));
      //Notify
      const assignmentOperation: AssignmentOperationInterface = {
        assignment,
        operationType: "create",
      };
      this.assignment$.next(assignmentOperation);
    }
  }

  /**
   *
   * @param assignment the assignment to create
   * @returns true if assignment is created and saved, false if not
   */
  createAssignment(assignment: AssignmentInterface) {
    //Generate id for the assignment
    assignment.id = nanoid(this.configService.nanoMaxCharId);
    //Simulate we have saved and retrieved assignment, this is only for serialize Date and get an ISO string
    //This only happens on create, update respects the date and also delete.
    //We do this because we dont get again the assignments from file, they are in memory
    assignment = JSON.parse(JSON.stringify(assignment));
    //add assignment to assignments
    this.#assignments.push(assignment);
    this.#assignmentsMap.set(assignment.id, assignment);
    this.addOrUpdateAssignmentToAssignmentByDateMap(assignment);
    //ORDER THE ASSIGNMENTS BY MOST RECENT DATE
    this.#assignments = this.#assignments.sort(this.sortAssignmentsByDateDesc);

    //save assignments with the new assignment
    this.saveAssignmentsToFile();

    //Notify
    const assignmentOperation: AssignmentOperationInterface = {
      assignment,
      operationType: "create",
    };
    this.assignment$.next(assignmentOperation);
  }

  /**
   *
   * @param a AssignmentInterface the assignment A
   * @param b AssignmentInterface the assignment B
   * @returns number the 1,-1,0 logic for the sort method
   */
  sortAssignmentsByDateDesc(
    a: AssignmentInterface | AssignmentTableInterface,
    b: AssignmentInterface | AssignmentTableInterface,
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
    a: AssignmentInterface | AssignmentTableInterface,
    b: AssignmentInterface | AssignmentTableInterface,
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
    return this.#assignmentsMap.get(id);
  }

  /**
   *
   * @param assignment the assignment to update
   * @returns true if assignment is updated and saved false otherwise
   */
  updateAssignment(assignment: AssignmentInterface) {
    //update assignment
    for (let i = 0; i < this.#assignments.length; i++) {
      if (this.#assignments[i].id === assignment.id) {
        this.#assignments[i] = assignment;
        this.#assignmentsMap.set(assignment.id, assignment);
        this.addOrUpdateAssignmentToAssignmentByDateMap(assignment);
        //save assignments with the updated assignment
        this.saveAssignmentsToFile();
        break;
      }
    }
    //Notify
    const assignmentOperation: AssignmentOperationInterface = {
      assignment,
      operationType: "update",
    };
    this.assignment$.next(assignmentOperation);
  }

  /**
   *
   * @param originDate the origin date to change
   * @param destinyDate the destiny date to have
   * @returns
   */
  massiveDateChange(originDate: Date, destinyDate: Date) {
    for (const assignment of this.#assignments) {
      if (new Date(assignment.date).getTime() === originDate.getTime()) {
        assignment.date = destinyDate;
        this.#assignmentsMap.set(assignment.id, assignment);
        this.addOrUpdateAssignmentToAssignmentByDateMap(assignment);
      }
    }
    //save assignments with the updated date
    this.saveAssignmentsToFile();
  }

  /**
   *
   * @param date the date we want to delete all assignments
   */
  massiveAssignmentDelete(date: Date, assignTypesIds: string[]) {
    this.#assignments = this.#assignments.filter((a) => {
      if (assignTypesIds && assignTypesIds.includes(a.assignType)) {
        if (new Date(a.date).getTime() === date.getTime()) {
          this.#assignmentsMap.delete(a.id);
          this.deleteAssignmentToAssignmentByDateMap(a);
          return false;
        }
        return true;
      }
      return true;
    });
    //save assignments
    this.saveAssignmentsToFile();
  }

  deleteAssignmentToAssignmentByDateMap(assignment: AssignmentInterface) {
    const isoDate = new Date(assignment.date).toISOString();
    let assignmentsByDate = this.#assignmentsByDateMap.get(isoDate);
    assignmentsByDate = assignmentsByDate.filter((a) => a.id !== assignment.id);
    if (assignmentsByDate.length) {
      this.#assignmentsByDateMap.set(isoDate, assignmentsByDate);
    } else {
      //dont need the key if we have 0 assignments
      this.#assignmentsByDateMap.delete(isoDate);
    }
  }

  /**
   *
   * @param assignment the assignment to delete
   * @returns true if assignment is deleted and saved false otherwise
   */
  deleteAssignment(id: string) {
    //The assignment to delete
    const assignment = this.#assignmentsMap.get(id);
    //delete assignment
    this.#assignments = this.#assignments.filter((a) => a.id !== id);
    //this map delete order is important because AssignmentByDateMap needs an assignment not an id
    this.deleteAssignmentToAssignmentByDateMap(assignment);
    this.#assignmentsMap.delete(id);

    //save assignments
    this.saveAssignmentsToFile();
    //Notify
    const assignmentOperation: AssignmentOperationInterface = {
      assignment,
      operationType: "delete",
    };
    this.assignment$.next(assignmentOperation);
  }

  /**
   *
   * @param id the id of the participant to delete assignments by.
   * @returns true if assignment is deleted and saved false otherwise
   */
  deleteAssignmentsByParticipant(participantId: string) {
    this.#assignmentsMap = new Map();
    this.#assignmentsByDateMap = new Map();

    //delete assignments of the participant being the principal
    this.#assignments = this.#assignments.filter((a) => a.principal !== participantId);

    //Reset to undefined in assistant
    for (const assignment of this.#assignments) {
      if (assignment.assistant === participantId) {
        assignment.assistant = undefined;
      }
      this.#assignmentsMap.set(assignment.id, assignment);
      this.addOrUpdateAssignmentToAssignmentByDateMap(assignment);
    }

    //save assignments
    this.saveAssignmentsToFile();
  }

  /**
   * @param id the id of the room to delete assignments by
   */
  deleteAssignmentsByRoom(id: string) {
    this.#assignmentsMap = new Map();
    this.#assignmentsByDateMap = new Map();
    //delete assignments
    this.#assignments = this.#assignments.filter((a) => a.room !== id);

    for (const assignment of this.#assignments) {
      this.#assignmentsMap.set(assignment.id, assignment);
      this.addOrUpdateAssignmentToAssignmentByDateMap(assignment);
    }

    //save assignments
    this.saveAssignmentsToFile();
  }

  /**
   * @param id the id of the sheet title to delete assignments by
   */
  removeAssignmentsSheetTitleProperty(id: string) {
    this.#assignmentsMap = new Map();
    this.#assignmentsByDateMap = new Map();
    //delete sheet title property
    this.#assignments.forEach((a) => {
      if (a.sheetTitle === id) a.sheetTitle = "";
    });

    this.updateAssignmentMaps();
  }

  /**
   * @param id the id of the public theme to delete assignments by
   */
  removeAssignmentsPublicThemeProperty(id: string) {
    this.#assignmentsMap = new Map();
    this.#assignmentsByDateMap = new Map();
    //delete sheet title property
    this.#assignments.forEach((a) => {
      if (a.isPTheme && a.theme === id) a.theme = "";
    });

    this.updateAssignmentMaps();
  }

  private updateAssignmentMaps() {
    for (const assignment of this.#assignments) {
      this.#assignmentsMap.set(assignment.id, assignment);
      this.addOrUpdateAssignmentToAssignmentByDateMap(assignment);
    }

    //save assignments
    this.saveAssignmentsToFile();
  }

  /**
   * @param id the id of the assignType to delete assignments by
   */
  deleteAssignmentsByAssignType(id: string) {
    this.#assignmentsMap = new Map();

    //delete assignments
    this.#assignments = this.#assignments.filter((a) => a.assignType !== id);

    for (const assignment of this.#assignments) {
      this.#assignmentsMap.set(assignment.id, assignment);
      this.addOrUpdateAssignmentToAssignmentByDateMap(assignment);
    }

    //save assignments
    this.saveAssignmentsToFile();
  }

  /**
   *
   * @param participantId the participant id to search assignments
   * @param date optional param if provided will filter only for that date
   * @returns the assignments of the participant
   */
  findAssignmentsByParticipantId(participantId: string, date?: Date): AssignmentInterface[] {
    //By date
    if (date) {
      return this.getAssignmentsByDate(date).filter(
        (a) => a.principal === participantId || a.assistant === participantId,
      );
    }
    //By all assignments
    return this.#assignments.filter(
      (assignment) =>
        assignment.principal === participantId || assignment.assistant === participantId,
    );
  }

  /**
   *
   * @param id the id of the note to delete assignments by.
   * @returns true if assignment is deleted and saved false otherwise
   */
  resetAssignmentsByNote(id: string) {
    //reset assignments note
    for (const assignment of this.#assignments) {
      if (assignment.footerNote === id) {
        assignment.footerNote = undefined;
        this.#assignmentsMap.set(assignment.id, assignment);
        this.addOrUpdateAssignmentToAssignmentByDateMap(assignment);
      }
    }
    //save assignments
    this.saveAssignmentsToFile();
  }

  getAllAssignmentsByDaysBeforeAndAfter(
    currentDate: Date,
    daysThreshold: number,
  ): AssignmentInterface[] {
    let allDays: AssignmentInterface[] = [];
    for (let i = 1; i <= daysThreshold; i++) {
      allDays = allDays.concat(this.getAssignmentsByDate(addDays(currentDate, i)));
      allDays = allDays.concat(this.getAssignmentsByDate(subDays(currentDate, i)));
    }
    return allDays;
  }
}
