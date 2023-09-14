import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import {
  getDistanceBetweenPenultimaAndLast,
  getLastAssistantAssignment,
  getPenultimateAssistantAssignment,
  setAssistantCountById,
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
  Input,
  OnDestroy,
  OnChanges,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import { MatCheckbox, MatCheckboxChange, MatCheckboxModule } from "@angular/material/checkbox";
import { TranslocoService, TranslocoModule } from "@ngneat/transloco";
import { SortService } from "app/services/sort.service";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { NgFor } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatExpansionModule } from "@angular/material/expansion";
import { ExportService } from "app/services/export.service";
import { AssignTypeNamePipe } from "app/assigntype/pipe/assign-type-name.pipe";

@Component({
  selector: "app-assistant-count",
  templateUrl: "./assistant-count.component.html",
  styleUrls: ["./assistant-count.component.scss"],
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
export class AssistantCountComponent implements OnChanges, OnDestroy {
  @ViewChild("onlyWomenBox") onlyWomenBox: MatCheckbox;
  @ViewChild("onlyMenBox") onlyMenBox: MatCheckbox;
  @ViewChild("hideExternalsBox") hideExternalsBox: MatCheckbox;

  @Input() allowedAssignTypesIds;

  assistantList: ParticipantInterface[] & ParticipantDynamicInterface[];

  locales;

  subscription: Subscription = new Subscription();

  constructor(
    private assignmentService: AssignmentService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private translocoService: TranslocoService,
    private sortService: SortService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef,
    private assignTypeNamePipe: AssignTypeNamePipe
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
      nl, //Deutch
      ro, //Romanian
      tr, //Turkish
      pl, //Polish
    };
  }

  ngOnChanges(): void {
    this.initStatistics();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async initStatistics() {
    const assignments = (await this.assignmentService.getAssignments(true)).filter((a) =>
      this.allowedAssignTypesIds.includes(a.assignType)
    );
    /* available participants that can do this kind of type assignments
    Filter from the participant the assignTypes that are allowed
    and watch if he can participate as assistant of this assign types */
    const participants = this.participantService
      .getParticipants(true)
      .filter((p) =>
        p.assignTypes
          .filter((at) => this.allowedAssignTypesIds.includes(at.assignTypeId))
          .some((at) => !!at.canAssistant)
      )
      .filter((p) => p.available) as ParticipantDynamicInterface[];

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
        const assignType = this.assignTypeService.getAssignType(assignment.assignType);
        participant.lastAssignType = this.assignTypeNamePipe.transform(assignType);
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
        const assignType = this.assignTypeService.getAssignType(assignment.assignType);
        participant.penultimateAssignType = this.assignTypeNamePipe.transform(assignType);
      }
    }

    //Get the distance, i18n sensitive
    getDistanceBetweenPenultimaAndLast(
      participants,
      this.locales[this.translocoService.getActiveLang()]
    );

    //Order by count and distance
    this.assistantList = participants.sort(this.sortService.sortByCountAndByDistance);

    //Subscribe to lang changes and update "distanceBetweenPenultimaAndLast"
    this.subscription.unsubscribe();
    this.subscription = this.translocoService.langChanges$.subscribe(() => {
      //Assistant
      getDistanceBetweenPenultimaAndLast(
        participants,
        this.locales[this.translocoService.getActiveLang()]
      );
    });
    this.cdr.detectChanges();
  }

  /**
   *
   * @param event the checkbox change event
   */
  async changeWoman(event: MatCheckboxChange): Promise<void> {
    await this.initStatistics();
    if (!event.checked) {
      this.onlyMenBox.disabled = false;
      this.hideExternalsBox.disabled = false;
      return;
    }
    this.onlyMenBox.disabled = true;
    this.hideExternalsBox.disabled = true;
    this.assistantList = this.filterOnlyWomen();
  }

  /**
   *
   * @param event the checkbox change event
   */
  async changeMan(event: MatCheckboxChange): Promise<void> {
    await this.initStatistics();
    if (!event.checked) {
      this.onlyWomenBox.disabled = false;
      this.hideExternalsBox.checked = false;
      return;
    }
    this.onlyWomenBox.disabled = true;
    this.assistantList = this.filterOnlyMen();
  }
  /** Must respect women or men check */
  async changeExternals(event: MatCheckboxChange): Promise<void> {
    await this.initStatistics();

    if (this.onlyWomenBox.checked) this.assistantList = this.filterOnlyWomen();
    if (this.onlyMenBox.checked) this.assistantList = this.filterOnlyMen();

    if (!event.checked) {
      return;
    }
    this.assistantList = this.assistantList.filter((participant) => !participant.isExternal);
  }

  filterOnlyMen() {
    return this.assistantList.filter((participant) => !participant.isWoman);
  }

  filterOnlyWomen() {
    return this.assistantList.filter((participant) => participant.isWoman);
  }

  async toPng() {
    await this.exportService.toPng("toPngDivIdAssistant", "statistics-assistant");
  }
}
