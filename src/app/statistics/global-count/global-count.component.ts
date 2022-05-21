import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { TranslocoService } from "@ngneat/transloco";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import {
  getDistanceBetweenPenultimaAndLast,
  getLastAssignment,
  getPenultimateAssignment,
  setCountById,
  sortParticipantsByCount,
} from "app/functions";
import { ParticipantInterface } from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";
import { ca, enGB, es, pt } from "date-fns/locale";
import { Subscription } from "rxjs";

@Component({
  selector: "app-global-count",
  templateUrl: "./global-count.component.html",
  styleUrls: ["./global-count.component.scss"],
})
export class GlobalCountComponent implements OnInit, OnDestroy {
  globalListBackup: ParticipantInterface[];

  globalList: ParticipantInterface[];

  locales;

  panelOpenState;

  subscription$: Subscription;

  constructor(
    private assignmentService: AssignmentService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private translocoService: TranslocoService
  ) {
    this.locales = {
      es, //Spanish
      ca, //Catalan
      en: enGB, //English
      pt, //Portuguese
    };

    this.panelOpenState = false;
  }

  ngOnInit(): void {
    this.initStatistics();
  }

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();
  }

  initStatistics() {
    const assignmentList = this.assignmentService.getAssignments();
    const temporalGlobalList = this.participantService.getParticipants();

    //Global
    setCountById(assignmentList, temporalGlobalList);

    for (const participant of temporalGlobalList) {
      const assignment: AssignmentInterface = getLastAssignment(
        assignmentList,
        participant
      );
      //Get the lastAssignmentDate
      participant.lastAssignmentDate = assignment?.date;

      if (assignment) {
        //Search the assignmentType and inject
        const assignType = this.assignTypeService.getAssignType(
          assignment.assignType
        );
        participant.lastAssignType = assignType.name;
      }
    }

    //Get the penultimateAssignment
    for (const participant of temporalGlobalList) {
      const assignment: AssignmentInterface = getPenultimateAssignment(
        assignmentList,
        participant
      );
      participant.penultimateAssignmentDate = assignment?.date;

      if (assignment) {
        //Search the assignmentType and inject
        const assignType = this.assignTypeService.getAssignType(
          assignment.assignType
        );
        participant.penultimateAssignType = assignType.name;
      }
    }

    //Get the distance, i18n sensitive
    getDistanceBetweenPenultimaAndLast(
      temporalGlobalList,
      this.locales[this.translocoService.getActiveLang()]
    );

    //ORDER BY COUNT
    this.globalList = temporalGlobalList.sort(sortParticipantsByCount);

    //Subscribe to lang changes and update "distanceBetweenPenultimaAndLast"
    this.subscription$ = this.translocoService.langChanges$.subscribe(
      (lang) => {
        //Assistant
        getDistanceBetweenPenultimaAndLast(
          temporalGlobalList,
          this.locales[this.translocoService.getActiveLang()]
        );
      }
    );
  }

  /**
   *
   * @param event the change event
   */
  changeWoman(event: MatCheckboxChange): void {
    if (!event.checked) {
      //False, restores the state
      this.globalList = this.getBackupState();
    }
    //First, create a backup
    this.setBackupState();

    this.globalList = this.globalList.filter(
      (participant) => participant.isWoman
    );
  }

  changeMan(event: MatCheckboxChange): void {
    if (!event.checked) {
      //False, restores the state
      this.globalList = this.getBackupState();
      return;
    }
    //First, create a backup
    this.setBackupState();

    this.globalList = this.globalList.filter(
      (participant) => !participant.isWoman
    );
  }

  /**
   * Creates a copy of the participants
   */
  setBackupState() {
    this.globalListBackup = this.globalList.map((participant) => ({
      ...participant,
    }));
  }

  /**
   *
   * @returns the reference of the backup
   */
  getBackupState() {
    return this.globalListBackup;
  }
}
