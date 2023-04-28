import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import {
  getDistanceBetweenPenultimaAndLast,
  getLastAssignment,
  getPenultimateAssignment,
  setCountById,
} from "app/functions";
import { ParticipantDynamicInterface } from "app/participant/model/participant.model";
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

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { MatCheckboxChange, MatCheckboxModule } from "@angular/material/checkbox";
import { TranslocoService, TranslocoModule } from "@ngneat/transloco";
import { toPng } from "html-to-image";
import { SortService } from "app/services/sort.service";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { NgFor } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatExpansionModule } from "@angular/material/expansion";

@Component({
  selector: "app-global-count",
  templateUrl: "./global-count.component.html",
  styleUrls: ["./global-count.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatIconModule,
    NgFor,
    TranslocoLocaleModule,
  ],
})
export class GlobalCountComponent implements OnInit, OnDestroy {
  globalList: ParticipantDynamicInterface[] & ParticipantDynamicInterface[];

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
      es,
      ca,
      en: enGB,
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

    //Global
    setCountById(assignments, participants);

    for (const participant of participants) {
      const assignment: AssignmentInterface = getLastAssignment(assignments, participant);
      //Get the lastAssignmentDate
      participant.lastAssignmentDate = assignment?.date;

      if (assignment) {
        //Search the assignmentType and inject
        const assignType = this.assignTypeService.getAssignType(assignment.assignType);
        participant.lastAssignType = assignType.name;
      }
    }

    //Get the penultimateAssignment
    for (const participant of participants) {
      const assignment: AssignmentInterface = getPenultimateAssignment(
        assignments,
        participant
      );
      participant.penultimateAssignmentDate = assignment?.date;

      if (assignment) {
        //Search the assignmentType and inject
        const assignType = this.assignTypeService.getAssignType(assignment.assignType);
        participant.penultimateAssignType = assignType.name;
      }
    }

    //Get the distance, i18n sensitive
    getDistanceBetweenPenultimaAndLast(
      participants,
      this.locales[this.translocoService.getActiveLang()]
    );

    //Order by count and distance
    this.globalList = participants.sort(this.sortService.sortByCountAndByDistance);

    //Subscribe to lang changes and update "distanceBetweenPenultimaAndLast"
    this.subscription.add(
      this.translocoService.langChanges$.subscribe((lang) => {
        //Assistant
        getDistanceBetweenPenultimaAndLast(
          participants,
          this.locales[this.translocoService.getActiveLang()]
        );
      })
    );
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
    this.globalList = this.globalList.filter((participant) => participant.isWoman);
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
    this.globalList = this.globalList.filter((participant) => !participant.isWoman);
  }

  async toPng() {
    //the div
    document.body.style.cursor = "wait";
    const div = document.getElementById("toPngDivId");
    const dataUrl = await toPng(div);

    const link = document.createElement("a");
    link.href = dataUrl;
    link.setAttribute("download", "statistics-global");
    link.click();

    document.body.style.cursor = "default";
  }
}
