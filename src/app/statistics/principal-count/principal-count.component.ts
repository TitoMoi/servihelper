import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import {
  getDistanceBetweenPenultimaAndLast,
  getLastPrincipalAssignment,
  getPenultimatePrincipalAssignment,
  setPrincipalCountById,
} from "app/functions";
import {
  ParticipantDynamicInterface,
  ParticipantInterface,
} from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";
import {
  bn,
  ca,
  de,
  el,
  enGB,
  es,
  fr,
  hi,
  it,
  ja,
  ko,
  nl,
  pl,
  pt,
  ro,
  ru,
  tr,
  zhCN,
} from "date-fns/locale";
import { Subscription } from "rxjs";

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { MatLegacyCheckboxChange as MatCheckboxChange } from "@angular/material/legacy-checkbox";
import { TranslocoService } from "@ngneat/transloco";
import { SortService } from "app/services/sort.service";
import { toPng } from "html-to-image";

@Component({
  selector: "app-principal-count",
  templateUrl: "./principal-count.component.html",
  styleUrls: ["./principal-count.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrincipalCountComponent implements OnInit, OnDestroy {
  principalList: ParticipantInterface[] & ParticipantDynamicInterface[];

  locales;

  subscription: Subscription = new Subscription();

  constructor(
    private assignmentService: AssignmentService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private translocoService: TranslocoService,
    private sortService: SortService
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
  }

  ngOnInit(): void {
    this.initStatistics();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async initStatistics() {
    const assignments = await this.assignmentService.getAssignments(true);
    const participants: ParticipantDynamicInterface[] =
      this.participantService.getParticipants(true);

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

    //Order by count and distance
    this.principalList = participants.sort(
      this.sortService.sortByCountAndByDistance
    );

    //Subscribe to lang changes and update "distanceBetweenPenultimaAndLast"
    this.subscription = this.translocoService.langChanges$.subscribe((lang) => {
      //Get the distance, i18n sensitive
      getDistanceBetweenPenultimaAndLast(
        participants,
        this.locales[this.translocoService.getActiveLang()]
      );
    });
  }

  /**
   *
   * @param event the checkbox change event
   */
  async changeWoman(event: MatCheckboxChange): Promise<void> {
    await this.initStatistics();
    if (!event.checked) {
      return;
    }
    this.principalList = this.principalList.filter(
      (participant) => participant.isWoman
    );
  }

  /**
   *
   * @param event the checkbox change event
   */
  async changeMan(event: MatCheckboxChange): Promise<void> {
    await this.initStatistics();
    if (!event.checked) {
      return;
    }
    this.principalList = this.principalList.filter(
      (participant) => !participant.isWoman
    );
  }

  async toPng() {
    //the div
    document.body.style.cursor = "wait";
    const div = document.getElementById("toPngDivId");
    const dataUrl = await toPng(div);

    const link = document.createElement("a");
    link.href = dataUrl;
    link.setAttribute("download", "statistics-principal");
    link.click();

    document.body.style.cursor = "default";
  }
}
