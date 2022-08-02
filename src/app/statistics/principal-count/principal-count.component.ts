import { AssignmentInterface } from 'app/assignment/model/assignment.model';
import { AssignmentService } from 'app/assignment/service/assignment.service';
import { AssignTypeService } from 'app/assignType/service/assignType.service';
import {
    getDistanceBetweenPenultimaAndLast, getLastPrincipalAssignment,
    getPenultimatePrincipalAssignment, setPrincipalCountById, sortParticipantsByCount
} from 'app/functions';
import { ParticipantInterface } from 'app/participant/model/participant.model';
import { ParticipantService } from 'app/participant/service/participant.service';
import {
    bn, ca, de, el, enGB, es, fr, hi, it, ja, ko, nl, pl, pt, ro, ru, tr, zhCN
} from 'date-fns/locale';
import { Subscription } from 'rxjs';

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: "app-principal-count",
  templateUrl: "./principal-count.component.html",
  styleUrls: ["./principal-count.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      de,
      fr,
      it,
      ru,
      ja,
      ko, //Korean
      zhCN,
      hi,
      el,
      bn,
      nl,
      ro,
      tr,
      pl,
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

    //Principal
    setPrincipalCountById(assignments, participants);

    for (const participant of participants) {
      const assignment: AssignmentInterface = getLastPrincipalAssignment(
        assignments,
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
    for (const participant of participants) {
      const assignment: AssignmentInterface = getPenultimatePrincipalAssignment(
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
    this.principalList = participants.sort(sortParticipantsByCount);

    //Subscribe to lang changes and update "distanceBetweenPenultimaAndLast"
    this.subscription$ = this.translocoService.langChanges$.subscribe(
      (lang) => {
        //Get the distance, i18n sensitive
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
    this.principalList = this.principalList.filter(
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
    this.principalList = this.principalList.filter(
      (participant) => !participant.isWoman
    );
  }
}
