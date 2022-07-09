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
import {
  ca,
  enGB,
  es,
  pt,
  de,
  fr,
  it,
  ru,
  ja,
  ko,
  zhCN,
  hi,
  el,
  bn,
} from "date-fns/locale";
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
      de, //German
      fr, //French
      it, //Italian
      ru, //Russian
      ja, //Japanese
      ko, //Korean
      zhCN, //Chinese simplified
      hi, //Hindi
      el, //Greek
      bn, //Bengali
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
    const assignments = this.assignmentService.getAssignments(true);
    const participants = this.participantService.getParticipants(true);

    //Assistant
    setAssistantCountById(assignments, participants);

    //Get the lastAssignmentDate
    for (const participant of participants) {
      const assignment: AssignmentInterface = getLastAssistantAssignment(
        assignments,
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
    for (const participant of participants) {
      const assignment: AssignmentInterface = getPenultimateAssistantAssignment(
        assignments,
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
      participants,
      this.locales[this.translocoService.getActiveLang()]
    );

    //ORDER BY COUNT
    this.assistantList = participants.sort(sortParticipantsByCount);

    //Subscribe to lang changes and update "distanceBetweenPenultimaAndLast"
    this.subscription$ = this.translocoService.langChanges$.subscribe(
      (lang) => {
        //Assistant
        getDistanceBetweenPenultimaAndLast(
          participants,
          this.locales[this.translocoService.getActiveLang()]
        );
      }
    );
  }

  /**
   *
   * @param event the checkbox change event
   */
  changeWoman(event: MatCheckboxChange): void {
    if (!event.checked) {
      this.initStatistics();
      return;
    }
    this.initStatistics();
    this.assistantList = this.assistantList.filter(
      (participant) => participant.isWoman
    );
  }

  /**
   *
   * @param event the checkbox change event
   */
  changeMan(event: MatCheckboxChange): void {
    if (!event.checked) {
      this.initStatistics();
      return;
    }
    this.initStatistics();
    this.assistantList = this.assistantList.filter(
      (participant) => !participant.isWoman
    );
  }
}
