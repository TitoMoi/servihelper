import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { TranslocoService } from "@ngneat/transloco";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import {
  getDistanceBetweenPenultimaAndLast,
  getLastAssistantAssignment,
  getPenultimateAssistantAssignment,
  setAssistantCountById,
  sortParticipantsByCount,
} from "app/functions";
import { ParticipantInterface } from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";
import { ca, enGB, es, pt } from "date-fns/locale";
import { Subscription } from "rxjs";

@Component({
  selector: "app-assistant-count",
  templateUrl: "./assistant-count.component.html",
  styleUrls: ["./assistant-count.component.scss"],
})
export class AssistantCountComponent implements OnInit, OnDestroy {
  assistantListBackup: ParticipantInterface[];

  assistantList: ParticipantInterface[];

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
    const temporalAssistantList = this.participantService.getParticipants();

    //Assistant
    setAssistantCountById(assignmentList, temporalAssistantList);

    //Get the lastAssignmentDate
    for (const participant of temporalAssistantList) {
      const assignment: AssignmentInterface = getLastAssistantAssignment(
        assignmentList,
        participant
      );
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
    for (const participant of temporalAssistantList) {
      const assignment: AssignmentInterface = getPenultimateAssistantAssignment(
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
      temporalAssistantList,
      this.locales[this.translocoService.getActiveLang()]
    );

    //ORDER BY COUNT
    this.assistantList = temporalAssistantList.sort(sortParticipantsByCount);

    //Subscribe to lang changes and update "distanceBetweenPenultimaAndLast"
    this.subscription$ = this.translocoService.langChanges$.subscribe(
      (lang) => {
        //Assistant
        getDistanceBetweenPenultimaAndLast(
          temporalAssistantList,
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
    if (event.checked) {
      //First, create a backup
      this.setBackupState();

      this.assistantList = this.assistantList.filter(
        (participant) => participant.isWoman
      );
    } else {
      //False, restores the state
      this.assistantList = this.getBackupState();
    }
  }

  changeMan(event: MatCheckboxChange): void {
    if (event.checked) {
      //First, create a backup
      this.setBackupState();

      this.assistantList = this.assistantList.filter(
        (participant) => !participant.isWoman
      );
    } else {
      //False, restores the state
      this.assistantList = this.getBackupState();
    }
  }

  /**
   * Creates a copy of the participants
   */
  setBackupState() {
    this.assistantListBackup = this.assistantList.map((participant) => ({
      ...participant,
    }));
  }

  /**
   *
   * @returns the reference of the backup
   */
  getBackupState() {
    return this.assistantListBackup;
  }
}
