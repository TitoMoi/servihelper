import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import {
  getDistanceBetweenPenultimaAndLast,
  getLastAssignment,
  getPenultimateAssignment,
  setCountById,
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
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { MatCheckbox, MatCheckboxChange, MatCheckboxModule } from "@angular/material/checkbox";
import { TranslocoService, TranslocoModule } from "@ngneat/transloco";
import { SortService } from "app/services/sort.service";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatExpansionModule } from "@angular/material/expansion";
import { ExportService } from "app/services/export.service";
import { AssignTypeNamePipe } from "app/assigntype/pipe/assign-type-name.pipe";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { isSameMonth } from "date-fns";

@Component({
  selector: "app-global-count",
  templateUrl: "./global-count.component.html",
  styleUrls: ["./global-count.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatIconModule,
    TranslocoLocaleModule,
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
})
export class GlobalCountComponent implements OnChanges, OnDestroy {
  @ViewChild("onlyWomenBox") onlyWomenBox: MatCheckbox;
  @ViewChild("onlyMenBox") onlyMenBox: MatCheckbox;
  @ViewChild("hideExternalsBox") hideExternalsBox: MatCheckbox;

  @Input() allowedAssignTypesIds: string[];

  globalList: ParticipantInterface[] & ParticipantDynamicInterface[];

  locales;

  date = new FormControl();

  subscription: Subscription = new Subscription();

  constructor(
    private assignmentService: AssignmentService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private translocoService: TranslocoService,
    private sortService: SortService,
    private exportService: ExportService,
    private assignTypeNamePipe: AssignTypeNamePipe,
    private cdr: ChangeDetectorRef
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

  ngOnChanges() {
    this.getStatistics();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async getStatistics() {
    const assignments = (await this.assignmentService.getAssignments(true)).filter((a) =>
      this.allowedAssignTypesIds.includes(a.assignType) && this.date.value
        ? isSameMonth(a.date, this.date.value)
        : true
    );
    /* available participants that can do this kind of type assignments
    Filter from the participant the assignTypes that are allowed
    and watch if he can participate in some of this assign types */
    const participants = this.participantService
      .getParticipants(true)
      .filter((p) =>
        p.assignTypes
          .filter((at) => this.allowedAssignTypesIds.includes(at.assignTypeId))
          .some((at) => !!at.canPrincipal || !!at.canAssistant)
      )
      .filter((p) => p.available) as ParticipantDynamicInterface[];

    //Global
    setCountById(assignments, participants);

    for (const participant of participants) {
      const assignment: AssignmentInterface = getLastAssignment(assignments, participant);

      if (assignment) {
        //Get the lastAssignmentDate
        participant.lastAssignmentDate = assignment.date;
        participant.isPrincipalLastAssignment =
          assignment.principal === participant.id ? true : false;
        //Search the assignmentType and inject
        const assignType = this.assignTypeService.getAssignType(assignment.assignType);
        participant.lastAssignType = this.assignTypeNamePipe.transform(assignType);
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
        participant.isPrincipalPenultimateAssignment =
          assignment.principal === participant.id ? true : false;
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
    this.globalList = participants.sort(this.sortService.sortByCountAndByDistance);

    //Subscribe to lang changes and update "distanceBetweenPenultimaAndLast"
    this.subscription.unsubscribe();
    this.subscription.add(
      this.translocoService.langChanges$.subscribe(() => {
        //Assistant
        getDistanceBetweenPenultimaAndLast(
          participants,
          this.locales[this.translocoService.getActiveLang()]
        );
      })
    );
    this.cdr.detectChanges();
  }

  /**
   *
   * @param event the checkbox change event
   */
  async changeWoman(event: MatCheckboxChange): Promise<void> {
    await this.getStatistics();
    if (!event.checked) {
      this.onlyMenBox.disabled = false;
      this.hideExternalsBox.disabled = false;
      return;
    }
    this.onlyMenBox.disabled = true;
    this.hideExternalsBox.disabled = true;
    this.globalList = this.filterOnlyWomen();
  }

  /**
   *
   * @param event the checkbox change event
   */
  async changeMan(event: MatCheckboxChange): Promise<void> {
    await this.getStatistics();
    if (!event.checked) {
      this.onlyWomenBox.disabled = false;
      this.hideExternalsBox.checked = false;
      return;
    }
    this.onlyWomenBox.disabled = true;
    this.globalList = this.filterOnlyMen();
  }

  /** Must respect women or men check */
  async changeExternals(event: MatCheckboxChange): Promise<void> {
    await this.getStatistics();

    if (this.onlyWomenBox.checked) this.globalList = this.filterOnlyWomen();
    if (this.onlyMenBox.checked) this.globalList = this.filterOnlyMen();

    if (!event.checked) {
      return;
    }
    this.globalList = this.globalList.filter((participant) => !participant.isExternal);
  }

  filterOnlyMen() {
    return this.globalList.filter((participant) => !participant.isWoman);
  }

  filterOnlyWomen() {
    return this.globalList.filter((participant) => participant.isWoman);
  }

  async toPng() {
    this.exportService.toPng("toPngDivId", "statistics-global");
  }
}
