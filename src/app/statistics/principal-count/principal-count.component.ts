import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { TranslocoService } from "@ngneat/transloco";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import {
  getDistanceBetweenPenultimaAndLast,
  getLastPrincipalAssignment,
  getPenultimatePrincipalAssignment,
  setPrincipalCountById,
  sortParticipantsByCount,
} from "app/functions";
import { ParticipantInterface } from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";
import { ca, enGB, es, pt } from "date-fns/locale";
import { Subscription } from "rxjs";

@Component({
  selector: "app-principal-count",
  templateUrl: "./principal-count.component.html",
  styleUrls: ["./principal-count.component.scss"],
})
export class PrincipalCountComponent implements OnInit, OnDestroy {
  principalListBackup: ParticipantInterface[];

  principalList: ParticipantInterface[];

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
    const temporalPrincipalList = this.participantService.getParticipants();

    //Principal
    setPrincipalCountById(assignmentList, temporalPrincipalList);

    for (const participant of temporalPrincipalList) {
      const assignment: AssignmentInterface = getLastPrincipalAssignment(
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

    //Get the penultimateAssignmentDate
    for (const participant of temporalPrincipalList) {
      const assignment: AssignmentInterface = getPenultimatePrincipalAssignment(
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
      temporalPrincipalList,
      this.locales[this.translocoService.getActiveLang()]
    );

    //ORDER BY COUNT
    this.principalList = temporalPrincipalList.sort(sortParticipantsByCount);

    //Subscribe to lang changes and update "distanceBetweenPenultimaAndLast"
    this.subscription$ = this.translocoService.langChanges$.subscribe(
      (lang) => {
        //Get the distance, i18n sensitive
        getDistanceBetweenPenultimaAndLast(
          temporalPrincipalList,
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
      this.principalList = this.getBackupState();
      return;
    }
    //First, create a backup
    this.setBackupState();

    this.principalList = this.principalList.filter(
      (participant) => participant.isWoman
    );
  }

  changeMan(event: MatCheckboxChange): void {
    if (!event.checked) {
      //False, restores the state
      this.principalList = this.getBackupState();
      return;
    }
    //First, create a backup
    this.setBackupState();

    this.principalList = this.principalList.filter(
      (participant) => !participant.isWoman
    );
  }

  /**
   * Creates a copy of the participants
   */
  setBackupState() {
    this.principalListBackup = this.principalList.map((participant) => ({
      ...participant,
    }));
  }

  /**
   *
   * @returns the reference of the backup
   */
  getBackupState() {
    return this.principalListBackup;
  }
}