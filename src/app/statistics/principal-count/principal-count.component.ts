import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
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
  ViewChild,
} from "@angular/core";
import { MatCheckbox, MatCheckboxChange, MatCheckboxModule } from "@angular/material/checkbox";
import { TranslocoService, TranslocoModule } from "@ngneat/transloco";
import { SortService } from "app/services/sort.service";
import { toPng } from "html-to-image";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { NgFor } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatExpansionModule } from "@angular/material/expansion";

@Component({
  selector: "app-principal-count",
  templateUrl: "./principal-count.component.html",
  styleUrls: ["./principal-count.component.scss"],
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
export class PrincipalCountComponent implements OnInit, OnDestroy {
  @ViewChild("onlyWomenBox") onlyWomenBox: MatCheckbox;
  @ViewChild("onlyMenBox") onlyMenBox: MatCheckbox;
  @ViewChild("onlyExternalsBox") onlyExternalsBox: MatCheckbox;

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
        const assignType = this.assignTypeService.getAssignType(assignment.assignType);
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
    this.principalList = participants.sort(this.sortService.sortByCountAndByDistance);

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
      this.onlyMenBox.disabled = false;
      this.onlyExternalsBox.disabled = false;
      return;
    }
    this.onlyMenBox.disabled = true;
    this.onlyExternalsBox.disabled = true;
    this.principalList = this.filterOnlyWomen();
  }

  /**
   *
   * @param event the checkbox change event
   */
  async changeMan(event: MatCheckboxChange): Promise<void> {
    await this.initStatistics();
    if (!event.checked) {
      this.onlyWomenBox.disabled = false;
      return;
    }
    this.onlyWomenBox.disabled = true;
    this.principalList = this.filterOnlyMen();
  }

  /** Must respect women or men check */
  async changeExternals(event: MatCheckboxChange): Promise<void> {
    await this.initStatistics();

    if (this.onlyWomenBox.checked) this.principalList = this.filterOnlyWomen();
    if (this.onlyMenBox.checked) this.principalList = this.filterOnlyMen();

    if (!event.checked) {
      return;
    }
    this.principalList = this.principalList.filter((participant) => !participant.isExternal);
  }

  filterOnlyMen() {
    return this.principalList.filter((participant) => !participant.isWoman);
  }

  filterOnlyWomen() {
    return this.principalList.filter((participant) => participant.isWoman);
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
