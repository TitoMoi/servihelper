/* eslint-disable complexity */
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import {
  getDistanceBetweenPenultimaAndLast,
  getLastAssignment,
  getLastAssistantAssignment,
  getLastPrincipalAssignment,
  getPenultimateAssignment,
  getPenultimateAssistantAssignment,
  getPenultimatePrincipalAssignment,
  setAssistantCountById,
  setCountById,
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
  hr,
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
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatCheckbox, MatCheckboxChange, MatCheckboxModule } from "@angular/material/checkbox";
import { TranslocoService, TranslocoModule } from "@ngneat/transloco";
import { SortService } from "app/services/sort.service";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";

import { MatIconModule } from "@angular/material/icon";
import { MatExpansionModule } from "@angular/material/expansion";
import { ExportService } from "app/services/export.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { isWithinInterval } from "date-fns";

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
    TranslocoLocaleModule,
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
})
export class GlobalCountComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild("onlyWomenBox") onlyWomenBox: MatCheckbox;
  @ViewChild("onlyMenBox") onlyMenBox: MatCheckbox;
  @ViewChild("hideExternalsBox") hideExternalsBox: MatCheckbox;
  @ViewChild("onlyPrincipalsBox") onlyPrincipalsBox: MatCheckbox;
  @ViewChild("onlyAssistantsBox") onlyAssistantsBox: MatCheckbox;

  @Input() allowedAssignTypesIds: string[];

  globalList: ParticipantInterface[] & ParticipantDynamicInterface[];

  locales;

  participants = [];

  form = this.formBuilder.group<Record<string, Date>>({
    dateStart: null,
    dateEnd: null,
  });

  subscription: Subscription = new Subscription();

  constructor(
    private assignmentService: AssignmentService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private translocoService: TranslocoService,
    private sortService: SortService,
    private exportService: ExportService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
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
      hr,
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

  ngOnInit(): void {
    this.subscription.add(
      this.form.valueChanges.subscribe(async (v) => {
        if (v.dateStart && v.dateEnd) {
          await this.getStatistics();
        }
      }),
    );

    //Subscribe to lang changes and update "distanceBetweenPenultimaAndLast"
    this.subscription.add(
      this.translocoService.langChanges$.subscribe(() => {
        //Assistant
        if (this.participants.length) {
          getDistanceBetweenPenultimaAndLast(
            this.participants,
            this.locales[this.translocoService.getActiveLang()],
          );
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async getStatistics() {
    const assignments = (await this.assignmentService.getAssignments(true)).filter(
      (a) =>
        this.allowedAssignTypesIds.includes(a.assignType) &&
        (this.form.value.dateStart && this.form.value.dateEnd
          ? // For the date within the interval
            isWithinInterval(new Date(a.date), {
              start: new Date(this.form.value.dateStart),
              end: new Date(this.form.value.dateEnd),
            })
          : true), //true means get all assignments
    );

    /* available participants that can do this kind of type assignments
    Filter from the participant the assignTypes that are allowed
    and watch if he can participate in some of this assign types */
    this.participants = [];
    this.participants = this.participantService.getParticipants(true).filter(
      (p) =>
        (p.available && this.onlyWomenBox.checked
          ? Boolean(p.isWoman)
          : false || this.onlyMenBox.checked
            ? Boolean(p.isWoman) === false
            : false || (!this.onlyWomenBox.checked && !this.onlyMenBox.checked)) &&
        p.assignTypes
          .filter((at) => this.allowedAssignTypesIds.includes(at.assignTypeId))
          .some((at) => {
            return (
              (this.onlyPrincipalsBox.checked ? !!at.canPrincipal : false) ||
              (this.onlyAssistantsBox.checked ? !!at.canAssistant : false) ||
              (!this.onlyPrincipalsBox.checked && !this.onlyAssistantsBox.checked)
            );
          }),
    ) as ParticipantDynamicInterface[];

    //Global
    if (!this.onlyPrincipalsBox.checked && !this.onlyAssistantsBox.checked) {
      setCountById(assignments, this.participants);
    }
    //principals
    if (this.onlyPrincipalsBox.checked) {
      setPrincipalCountById(assignments, this.participants);
    }
    //assistants
    if (this.onlyAssistantsBox.checked) {
      setAssistantCountById(assignments, this.participants);
    }

    for (const participant of this.participants) {
      let assignment: AssignmentInterface;
      //Get the lastAssignmentDate
      //Global
      if (!this.onlyPrincipalsBox.checked && !this.onlyAssistantsBox.checked) {
        assignment = getLastAssignment(assignments, participant);
        if (assignment) {
          participant.isPrincipalLastAssignment = assignment.principal === participant.id;
          participant.isAssistantLastAssignment = assignment.assistant === participant.id;
        }
      }
      //principals
      if (this.onlyPrincipalsBox.checked) {
        assignment = getLastPrincipalAssignment(assignments, participant);
        if (assignment) participant.isPrincipalLastAssignment = true;
      }
      //assistants
      if (this.onlyAssistantsBox.checked) {
        assignment = getLastAssistantAssignment(assignments, participant);
        if (assignment) participant.isAssistantLastAssignment = true;
      }

      if (assignment) {
        participant.lastAssignmentDate = assignment.date;
        //Search the assignmentType and inject
        const assignType = this.assignTypeService.getAssignType(assignment.assignType);
        participant.lastAssignType = this.assignTypeService.getNameOrTranslation(assignType);
      }
    }

    //Get the penultimateAssignment
    for (const participant of this.participants) {
      let assignment: AssignmentInterface;
      //Global
      if (!this.onlyPrincipalsBox.checked && !this.onlyAssistantsBox.checked) {
        assignment = getPenultimateAssignment(assignments, participant);
        if (assignment) {
          participant.isPrincipalPenultimateAssignment =
            assignment.principal === participant.id;
          participant.isAssistantPenultimateAssignment =
            assignment.assistant === participant.id;
        }
      }
      //principals
      if (this.onlyPrincipalsBox.checked) {
        assignment = getPenultimatePrincipalAssignment(assignments, participant);
        if (assignment) participant.isPrincipalPenultimateAssignment = true;
      }
      //assistants
      if (this.onlyAssistantsBox.checked) {
        assignment = getPenultimateAssistantAssignment(assignments, participant);
        if (assignment) participant.isAssistantPenultimateAssignment = true;
      }

      if (assignment) {
        participant.penultimateAssignmentDate = assignment?.date;
        //Search the assignmentType and inject
        const assignType = this.assignTypeService.getAssignType(assignment.assignType);
        participant.penultimateAssignType =
          this.assignTypeService.getNameOrTranslation(assignType);
      }
    }

    //Get the distance, i18n sensitive
    getDistanceBetweenPenultimaAndLast(
      this.participants,
      this.locales[this.translocoService.getActiveLang()],
    );

    //Order by count and distance
    this.globalList = this.participants.sort(this.sortService.sortByCountAndByDistance);
    this.cdr.detectChanges();
  }

  async changeOnlyPrincipals() {
    this.onlyAssistantsBox.disabled = !this.onlyAssistantsBox.disabled;
    await this.getStatistics();
    if (this.onlyMenBox.checked) this.globalList = this.filterOnlyMen();
    if (this.onlyWomenBox.checked) this.globalList = this.filterOnlyWomen();
  }

  async changeOnlyAssistants() {
    this.onlyPrincipalsBox.disabled = !this.onlyPrincipalsBox.disabled;
    await this.getStatistics();
    if (this.onlyMenBox.checked) this.globalList = this.filterOnlyMen();
    if (this.onlyWomenBox.checked) this.globalList = this.filterOnlyWomen();
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
