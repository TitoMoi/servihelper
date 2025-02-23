/* eslint-disable complexity */
import {
  AssignmentInterface,
  StarvingAssignmentsDataContext,
} from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { LastDateService } from "app/assignment/service/last-date.service";
import { AssignTypeInterface, AssignTypes } from "app/assigntype/model/assigntype.model";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ConfigService } from "app/config/service/config.service";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import {
  ParticipantDynamicInterface,
  ParticipantInterface,
} from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";
import { SharedService } from "app/services/shared.service";
import { Subscription, filter, map } from "rxjs";

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from "@angular/forms";
import { MatButton, MatButtonModule } from "@angular/material/button";
import { MatSelect, MatSelectModule } from "@angular/material/select";
import { ActivatedRoute, Router, RouterLink, RouterModule } from "@angular/router";
import { RoleInterface } from "app/roles/model/role.model";
import { MatDialog } from "@angular/material/dialog";
import { InfoAssignmentComponent } from "../info-assignment/info-assignment.component";
import { SortService } from "app/services/sort.service";
import { WarningAssignmentComponent } from "../warning-assignment/warning-assignment.component";
import { StarvingAssignmentComponent } from "../starving-assignment/starving-assignment.component";
import {
  MatDatepicker,
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from "@angular/material/datepicker";
import { MatCheckboxChange, MatCheckboxModule } from "@angular/material/checkbox";
import { ParticipantPipe } from "../../participant/pipe/participant.pipe";
import { MatIconModule } from "@angular/material/icon";
import { MatOptionModule } from "@angular/material/core";
import { AutoFocusDirective } from "../../directives/autofocus/autofocus.directive";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { AsyncPipe, NgFor, NgIf } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule, TranslocoService } from "@ngneat/transloco";
import { SheetTitleInterface } from "app/sheet-title/model/sheet-title.model";
import { SheetTitleService } from "app/sheet-title/service/sheet-title.service";
import { PublicThemeInterface } from "app/public-theme/model/public-theme.model";
import { PublicThemeService } from "app/public-theme/service/public-theme.service";
import { PublicThemePipe } from "app/public-theme/pipe/public-theme.pipe";
import { addDays, differenceInDays, parseISO, subDays } from "date-fns";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AssignTypeNamePipe } from "app/assigntype/pipe/assign-type-name.pipe";
import { RoomNamePipe } from "app/room/pipe/room-name.pipe";
import { OnlineService } from "app/online/service/online.service";
import { CloseAssignmentsComponent } from "../close-assignments/close-assignments.component";
import { getLastPrincipalAssignment, getPenultimatePrincipalAssignment } from "app/functions";
import { DateFnsLocaleService } from "app/services/date-fns-locale.service";
@Component({
  selector: "app-create-update-assignment",
  templateUrl: "./create-update-assignment.component.html",
  styleUrls: ["./create-update-assignment.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    RouterModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    AutoFocusDirective,
    MatSelectModule,
    MatTooltipModule,
    MatOptionModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    AsyncPipe,
    NgIf,
    NgFor,
    ParticipantPipe,
    PublicThemePipe,
    AssignTypeNamePipe,
    RoomNamePipe,
  ],
})
export class CreateUpdateAssignmentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("principalSelect") principalSelect: MatSelect;
  @ViewChild("assistantSelect") assistantSelect: MatSelect;
  @ViewChild("btnSaveCreateAnother") btnSaveCreateAnother: MatButton;

  //Angular material datepicker hacked
  @ViewChild("multipleDatePicker") datePickerRef: MatDatepicker<Date>;

  //Props for the datepicker multiple dates hack
  isMultipleDates = false;
  closeOnSelected = false;
  init = new Date();
  selectedDates: Date[] = [];
  timeoutRef;
  resetModel = undefined;
  timeoutExecuted = true; //first time
  //end of props for datepicker hack

  //Starving
  starvingSchoolParticipants = [];

  availableGroups: number[] = [];

  rooms: RoomInterface[] = this.roomService
    .getRooms()
    .sort((a, b) => (a.order > b.order ? 1 : -1));
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  sheetTitles: SheetTitleInterface[] = this.sheetTitleService
    .getTitles()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  publicThemes: PublicThemeInterface[] = this.publicThemeService
    .getPublicThemes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  //A flag to indicate that all assign types for the current role have been scheduled
  noAvailableAssignTypesByRole = false;
  //to filter available dates
  participants: ParticipantDynamicInterface[] = [];

  principals: ParticipantDynamicInterface[] = [];
  assistants: ParticipantDynamicInterface[] = [];
  companions: ParticipantDynamicInterface[] = [];

  footerNotes: NoteInterface[] = this.noteService.getNotes();
  assignments: AssignmentInterface[];

  assignmentsBySelectedDate: AssignmentInterface[] = [];

  role$ = this.configService.config$.pipe(
    map(() => this.configService.getRole(this.configService.getCurrentRoleId())),
  );

  role: RoleInterface;

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  //Fill the form with the assignment passed by the router
  a: AssignmentInterface = this.assignmentService.getAssignment(
    this.activatedRoute.snapshot.params.id,
  );

  isUpdate = this.a !== undefined;

  //To modify the template
  //ToDo: Change to typed forms and remove this (use the form isPTheme)
  isPTheme = this.a?.isPTheme;

  config = this.configService.getConfig();
  //FORM Update or create
  form: UntypedFormGroup = this.formBuilder.group({
    id: this.a?.id,
    sheetTitle: this.a ? this.a.sheetTitle : this.config.assignmentHeaderTitle, //not undefined
    date: [
      {
        value: this.a?.date,
        disabled: this.a ? true : false,
      },
      Validators.required,
    ],
    room: [
      //Room id
      {
        value: this.a?.room,
        disabled: this.a ? true : false,
      },
      Validators.required,
    ],
    assignType: [
      //AssignType id
      {
        value: this.a?.assignType,
        disabled: this.a ? true : false,
      },
      Validators.required,
    ],
    theme: new FormControl(this.a ? this.a.theme : "", { updateOn: "blur" }),
    isPTheme: this.a ? this.a.isPTheme : false,
    onlyWoman: [{ value: this.a ? this.a.onlyWoman : false, disabled: this.a?.isPTheme }],
    onlyMan: [this.a ? this.a.onlyMan : false],
    onlyExternals: [this.a ? this.a.onlyExternals : false],
    principal: [this.a?.principal, Validators.required], //participant id
    group: [this.a ? this.a.group : 0], //null is not working
    assistant: [this.a?.assistant], //participant id
    footerNote: this.a ? this.a.footerNote : this.config.defaultFooterNoteId, //Note id
    onlySortByTime: [this.config.isClassicSortEnabled],
  });

  //Subscriptions
  subscription = new Subscription();

  constructor(
    public lastDateService: LastDateService,
    private formBuilder: UntypedFormBuilder,
    private assignmentService: AssignmentService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private noteService: NoteService,
    private configService: ConfigService,
    private sheetTitleService: SheetTitleService,
    private publicThemeService: PublicThemeService,
    private sharedService: SharedService,
    private sortService: SortService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private matDialog: MatDialog,
    private onlineService: OnlineService,
    private dateFnsLocaleService: DateFnsLocaleService,
    private translocoService: TranslocoService,
    private cdr: ChangeDetectorRef,
  ) {
    this.getAssignments();
  }

  ngAfterViewInit(): void {
    if (!this.isUpdate) this.form.markAllAsTouched();
  }

  ngOnInit() {
    //Get the view values
    if (this.isUpdate) {
      this.getParticipantsAvailableOnDate();
      this.batchGetCountSortWarning();
      this.removePrincipalFromAssistants(this.gfv("principal"));
      this.enableOrDisableAssistantControl(this.gfv("assignType"));
    }

    // Because role is now observable and not behaviour we need to trigger the first time
    this.role = this.configService.getRole(this.configService.getCurrentRoleId());
    this.filterAssignmentsByRole();
    this.removeAssignTypesThatAlreadyExistOnDate();

    //Prepare the form changes
    this.prepareRole();
    this.prepareOnlySortByTime();
    this.prepareDateSub();
    this.prepareRoomSub();
    this.prepareIsPublicSpeechAssignTypeSub();
    this.prepareAssignTypeSub();
    this.prepareOnlyManSub();
    this.prepareOnlyWomanSub();
    this.prepareOnlyExternalsSub();
    this.preparePrincipalSub();
    this.prepareGroupSub();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleIsMultipleDates(e: MatCheckboxChange) {
    const dateCtrl = this.form.get("date");
    //Reset first
    this.form.get("date").reset();
    this.selectedDates = [];

    if (e.checked) {
      dateCtrl.clearValidators();
    } else {
      dateCtrl.addValidators(Validators.required);
    }
    dateCtrl.updateValueAndValidity();
    this.isMultipleDates = !this.isMultipleDates;
    this.cdr.detectChanges();
  }

  async getAssignments() {
    this.assignments = await this.assignmentService.getAssignments();
  }

  getPThemeCount(pThemeId: string) {
    let count = 0;
    for (let i = 0; i < this.assignments.length; i++) {
      if (this.assignments[i].isPTheme && this.assignments[i].theme === pThemeId) {
        count++;
      }
    }
    return count;
  }

  /**
   * @param formControlName the form control name to get the value
   * @returns the value for the form control
   */
  gfv(formControlName: string) {
    return this.form.get(formControlName).value;
  }

  prepareOnlySortByTime() {
    this.subscription.add(
      this.form.get("onlySortByTime").valueChanges.subscribe(() => {
        this.batchCleanPrincipalAssistant();
        this.batchCleanGroup();
        this.batchGetCountSortWarning();
      }),
    );
  }
  prepareRole() {
    this.subscription.add(
      this.role$.subscribe((r) => {
        this.role = r;
        this.filterAssignmentsByRole();
        this.removeAssignTypesThatAlreadyExistOnDate();
      }),
    );
  }

  /** (view) Set count and last assignment date for principals */
  setPrincipalsCountAndLastDate() {
    if (!this.isMultipleDates && !this.gfv("onlySortByTime")) {
      this.sharedService.setCountAndLastAssignmentDateAndRoom(
        this.assignments,
        this.principals,
        this.gfv("assignType"),
        true,
      );
    }
  }

  /** (view) Set count and last assignment date for assistants */
  setAssistantsCountAndLastDate() {
    if (!this.isMultipleDates) {
      this.sharedService.setCountAndLastAssignmentDateAndRoom(
        this.assignments,
        this.assistants,
        this.gfv("assignType"),
        false,
      );
    }
  }

  /**
   * Sort the participants by time distance from latest selected assignment or belonging to a group to the selected form date
   */
  sortPrincipalsByTimeDistance() {
    const selectedDate = this.gfv("date");
    this.principals.sort((a, b) => {
      const diffInDaysA = differenceInDays(new Date(a.lastAssignmentDate), selectedDate);
      const diffInDaysB = differenceInDays(new Date(b.lastAssignmentDate), selectedDate);
      if (diffInDaysA < diffInDaysB) {
        return -1;
      }
      if (diffInDaysA > diffInDaysB) {
        return 1;
      }
      return 0;
    });
  }

  /** Batch operation, should not call other batch operations inside
   */
  batchGetCountSortWarning() {
    this.getTimeDistance();
    this.getPrincipalAndAssistant();
    this.setOnlyExternals();
    this.getAvailableGroups();
    this.setPrincipalsCountAndLastDate();
    this.setAssistantsCountAndLastDate();

    if (this.gfv("onlySortByTime")) {
      this.sortPrincipalsByTimeDistance();
      this.assistants.sort(this.sortService.sortParticipantsByCountOrDate);
    } else {
      this.principals.sort(this.sortService.sortParticipantsByCountOrDate);
      this.assistants.sort(this.sortService.sortParticipantsByCountOrDate);
    }

    this.warningIfAlreadyHasWork();
    this.checkIfExhausted();
    this.checkIsStarvingForSchool();
  }

  /** Sets the last two companions for the principal */
  setWomanCompanions() {
    const principalId = this.gfv("principal");
    if (principalId) {
      this.companions = [];
      let lastAssistant, penultAssistant;
      const lastAssign = getLastPrincipalAssignment(
        this.assignments,
        this.participantService.getParticipant(principalId),
      );
      const penultAssign = getPenultimatePrincipalAssignment(
        this.assignments,
        this.participantService.getParticipant(principalId),
      );

      if (lastAssign?.assistant) {
        lastAssistant = this.participantService.getParticipant(lastAssign.assistant);
      }
      if (penultAssign?.assistant) {
        penultAssistant = this.participantService.getParticipant(penultAssign.assistant);
      }

      if (lastAssistant) {
        this.companions.push(lastAssistant);
      }
      if (penultAssistant) {
        this.companions.push(penultAssistant);
      }
    }
  }
  /** (Form) batch clean principalId and assistantId, should not call other batch operations inside */
  batchCleanPrincipalAssistant() {
    this.form.get("principal").reset(undefined, { emitEvent: false });
    this.form.get("assistant").reset(undefined, { emitEvent: false });
  }

  /** (Form) batch clean group, should not call other batch operations inside */
  batchCleanGroup() {
    this.form.get("group").reset(0, { emitEvent: false });
  }

  prepareDateSub() {
    this.subscription = this.form.get("date").valueChanges.subscribe((date) => {
      this.lastDateService.lastDate = date;

      this.batchCleanPrincipalAssistant();
      this.batchCleanGroup();
      this.filterAssignmentsByRole();
      this.getParticipantsAvailableOnDate();
      this.removeAssignTypesThatAlreadyExistOnDate();
      this.batchGetCountSortWarning();
    });
    this.cdr.detectChanges();
  }

  prepareRoomSub() {
    this.subscription.add(
      this.form.get("room").valueChanges.subscribe(() => {
        this.batchCleanPrincipalAssistant();
        this.batchCleanGroup();
        this.filterAssignmentsByRole();
        this.removeAssignTypesThatAlreadyExistOnDate();
        this.batchGetCountSortWarning();
      }),
    );
    this.cdr.detectChanges();
  }

  prepareAssignTypeSub() {
    this.subscription.add(
      this.form
        .get("assignType")
        .valueChanges.pipe(filter((at) => at))
        .subscribe((assignTypeId: string) => {
          //is public speech
          const isPSpeech =
            this.assignTypeService.getAssignType(assignTypeId).type === "publicSpeech";
          isPSpeech
            ? this.form.get("isPTheme").setValue(true)
            : this.form.get("isPTheme").setValue(false);
          //Other assign types
          this.batchCleanPrincipalAssistant();
          this.batchCleanGroup();
          this.batchGetCountSortWarning();
          this.enableOrDisableAssistantControl(assignTypeId);
        }),
    );
    this.cdr.detectChanges();
  }

  prepareIsPublicSpeechAssignTypeSub() {
    this.subscription.add(
      this.form.get("isPTheme").valueChanges.subscribe((isPtheme: boolean) => {
        //To modify the template
        this.isPTheme = isPtheme;
        //Clear value of theme
        if (isPtheme) this.form.get("theme").reset();
        const onlyWomanCtrl = this.form.get("onlyWoman");
        this.isPTheme
          ? onlyWomanCtrl.disable({ emitEvent: false })
          : onlyWomanCtrl.enable({ emitEvent: false });
      }),
    );
  }

  /** (Form) Enable or disable the assistant control if assign type has assistant help */
  enableOrDisableAssistantControl(assignTypeId) {
    if (assignTypeId) {
      if (this.assignTypeService.getAssignType(assignTypeId).hasAssistant) {
        this.form.get("assistant").enable({ emitEvent: false });
      } else {
        this.form.get("assistant").disable({ emitEvent: false });
      }
      this.cdr.detectChanges();
    }
  }

  prepareOnlyManSub() {
    this.subscription.add(
      this.form.get("onlyMan").valueChanges.subscribe((onlyMan) => {
        this.batchCleanPrincipalAssistant();
        this.batchCleanGroup();

        if (!onlyMan) {
          this.batchGetCountSortWarning();
          return;
        }
        //Only man
        this.principals = this.principals.filter((p) => p.isWoman === false && !p.isExternal);
        this.assistants = this.assistants.filter((a) => a.isWoman === false && !a.isExternal);
      }),
    );
  }

  prepareOnlyWomanSub() {
    this.subscription.add(
      this.form.get("onlyWoman").valueChanges.subscribe((onlyWoman) => {
        this.batchCleanPrincipalAssistant();
        this.batchCleanGroup();
        if (!onlyWoman) {
          this.batchGetCountSortWarning();
          return;
        }
        //Only woman
        this.principals = this.principals.filter((p) => p.isWoman === true);
        this.assistants = this.assistants.filter((a) => a.isWoman === true);
      }),
    );
  }

  prepareOnlyExternalsSub() {
    this.subscription.add(
      this.form.get("onlyExternals").valueChanges.subscribe(() => {
        this.batchCleanPrincipalAssistant();
        this.batchCleanGroup();
        this.batchGetCountSortWarning();
      }),
    );
  }

  preparePrincipalSub() {
    this.subscription.add(
      this.form.get("principal").valueChanges.subscribe((newPrincId) => {
        //Check if older principal should be included in assistants
        if (this.isUpdate) {
          this.batchGetCountSortWarning();
        }
        if (this.participantService.getParticipant(newPrincId).isWoman) {
          this.setWomanCompanions();
        }
        //remove current selected principal from assistants
        this.removePrincipalFromAssistants(newPrincId);
      }),
    );
  }

  prepareGroupSub() {
    this.subscription.add(
      this.form.get("group").valueChanges.subscribe((group) => {
        this.batchCleanPrincipalAssistant();
        this.batchGetCountSortWarning();
        //0 is all groups so we skip the if
        if (group) {
          this.principals = this.principals.filter((p) => p.group === group);
        }
      }),
    );
  }

  setOnlyExternals() {
    //Only externals
    const onlyExternals = this.gfv("onlyExternals");
    this.principals = this.principals.filter((p) => Boolean(p.isExternal) === onlyExternals); //Compatibility, isExternal can be undefined
    this.assistants = this.assistants.filter((p) => Boolean(p.isExternal) === onlyExternals);
  }

  removePrincipalFromAssistants(principalId: string) {
    if (principalId) {
      for (const [i, a] of this.assistants.entries()) {
        if (a.id === principalId) {
          this.assistants.splice(i, 1);
          break;
        }
      }
    }
  }

  /**
   * Gets the principal and assistant based on the available participants, room, assignType and only selectors
   */
  getPrincipalAndAssistant() {
    if (this.gfv("room") && this.gfv("assignType")) {
      this.principals = this.sharedService.filterPrincipalsByAvailable(
        structuredClone(this.participants),
        this.gfv("assignType"),
        this.gfv("room"),
        this.gfv("onlyMan"),
        this.gfv("onlyWoman"),
      );

      this.assistants = this.sharedService.filterAssistantsByAvailable(
        structuredClone(this.participants),
        this.gfv("assignType"),
        this.gfv("room"),
        this.gfv("onlyMan"),
        this.gfv("onlyWoman"),
      );
    }
  }

  /**
   * Filter available participants by selected date and create a map of assignments by selected date.
   */
  getParticipantsAvailableOnDate() {
    this.participants = this.participantService.getParticipants(true);

    if (this.isMultipleDates) {
      return;
    }
    const dateControlValue = this.gfv("date");
    this.participants = this.participants.filter(
      (p) =>
        !p.notAvailableDates.some(
          (date) => new Date(dateControlValue).getTime() === new Date(date).getTime(),
        ),
    );
  }

  /** Get available non undefined groups, group them and sort in ascendant order */
  getAvailableGroups() {
    this.availableGroups = [
      ...new Set(this.principals.filter((p) => p.group).map((p) => p.group)),
    ].sort((n1, n2) => (n1 > n2 ? 1 : 0));
  }

  /** Highlight the principal or assistant if already has work */
  warningIfAlreadyHasWork() {
    if (!this.isMultipleDates) {
      const dateValue = this.gfv("date");
      const room = this.gfv("room");
      const assignType = this.gfv("assignType");

      if (dateValue && room && assignType) {
        for (const p of this.principals) {
          const hasWork = this.assignmentService
            .getAssignmentsByDate(dateValue)
            .some((a) => a.principal === p.id || a.assistant === p.id);
          p.hasWork = hasWork;
        }

        for (const as of this.assistants) {
          const hasWork = this.assignmentService
            .getAssignmentsByDate(dateValue)
            .some((a) => a.principal === as.id || a.assistant === as.id);

          as.hasWork = hasWork;
        }
      }
    }
  }

  /** Red and Yellow clock */
  checkIfExhausted() {
    const currentDate: Date = this.gfv("date");
    const roomId = this.gfv("room");
    const atId = this.gfv("assignType");

    if (currentDate && roomId && atId) {
      const at = this.assignTypeService.getAssignType(atId);
      const atType = at.type;

      //red clock
      this.checkIfAboveThreshold(currentDate, at);

      //Yellow clock assignments
      this.checkIsExhaustedForSchool(currentDate, atType);

      this.checkIfExhaustedForPrayer(currentDate, atType);

      this.checkIfExhaustedForTreasures(currentDate, atType);
    }
  }

  //red clock
  checkIfAboveThreshold(currentDate: Date, assignType: AssignTypeInterface) {
    /* get the threshold of the assign type itself */

    const days = assignType?.days;
    if (days) {
      //If we edit an assignment, we get the string iso instead of a real date
      if (typeof currentDate === "string") currentDate = parseISO(currentDate);

      //Get all the days before and after, its 1 based index
      let allDays: AssignmentInterface[] = [];
      for (let i = 1; i <= days; i++) {
        allDays = allDays.concat(
          this.assignmentService.getAssignmentsByDate(addDays(currentDate, i)),
        );
        allDays = allDays.concat(
          this.assignmentService.getAssignmentsByDate(subDays(currentDate, i)),
        );
      }
      for (const p of this.principals) {
        if (allDays.some((a) => a.assignType === assignType.id && a.principal === p.id)) {
          p.hasCollision = true;
        }
      }
    }
  }

  //yellow clock
  checkIsExhaustedForSchool(currentDate: Date, atType: AssignTypes) {
    const closeOthersDays = this.configService.getConfig().closeToOthersDays;

    if (closeOthersDays && this.assignTypeService.isOfTypeSchoolAssignTypes(atType)) {
      //If we edit an assignment, we get the string iso instead of a real date
      if (typeof currentDate === "string") currentDate = parseISO(currentDate);

      //Get all the assignments before and after the days treshold, its 1 based index
      const allDays = this.assignmentService.getAllAssignmentsByDaysBeforeAndAfter(
        currentDate,
        closeOthersDays,
      );

      for (const p of this.principals) {
        if (
          allDays.some(
            (a) =>
              this.assignTypeService.isOfTypeSchoolAssignTypes(
                this.assignTypeService.getAssignType(a.assignType).type,
              ) &&
              (a.principal === p.id || a.assistant === p.id),
          )
        ) {
          p.isCloseToOthers = true;
        }
      }

      for (const assist of this.assistants) {
        if (
          allDays.some(
            (a) =>
              this.assignTypeService.isOfTypeSchoolAssignTypes(
                this.assignTypeService.getAssignType(a.assignType).type,
              ) &&
              (a.principal === assist.id || a.assistant === assist.id),
          )
        ) {
          assist.isCloseToOthers = true;
        }
      }
    }
  }

  //yellow clock
  checkIfExhaustedForPrayer(currentDate: Date, atType: AssignTypes) {
    const closeOthersPrayerDays = this.configService.getConfig().closeToOthersPrayerDays;
    if (closeOthersPrayerDays && this.assignTypeService.isOfTypePrayer(atType)) {
      //If we edit an assignment, we get the string iso instead of a real date
      if (typeof currentDate === "string") currentDate = parseISO(currentDate);

      //Get all the assignments before and after the days treshold, its 1 based index
      const allDays = this.assignmentService.getAllAssignmentsByDaysBeforeAndAfter(
        currentDate,
        closeOthersPrayerDays,
      );

      for (const p of this.principals) {
        if (
          allDays.some(
            (a) =>
              this.assignTypeService.isOfTypePrayer(
                this.assignTypeService.getAssignType(a.assignType).type,
              ) && a.principal === p.id,
          )
        ) {
          p.isCloseToOthersPrayer = true;
        }
      }
    }
  }

  //yellow clock
  checkIfExhaustedForTreasures(currentDate: Date, atType: AssignTypes) {
    const closeOthersTreasuresEtcDays =
      this.configService.getConfig().closeToOthersTreasuresEtcDays;
    if (
      closeOthersTreasuresEtcDays &&
      this.assignTypeService.isOfTypeTreasuresAndOthers(atType)
    ) {
      //If we edit an assignment, we get the string iso instead of a real date
      if (typeof currentDate === "string") currentDate = parseISO(currentDate);

      //Get all the assignments before and after the days treshold, its 1 based index
      const allDays = this.assignmentService.getAllAssignmentsByDaysBeforeAndAfter(
        currentDate,
        closeOthersTreasuresEtcDays,
      );

      for (const p of this.principals) {
        if (
          allDays.some(
            (a) =>
              this.assignTypeService.isOfTypeTreasuresAndOthers(
                this.assignTypeService.getAssignType(a.assignType).type,
              ) && a.principal === p.id,
          )
        ) {
          p.isCloseToOthersTreasuresEtc = true;
        }
      }
    }
  }

  //Fork
  checkIsStarvingForSchool() {
    if (!this.gfv("onlySortByTime")) {
      const currentDate: Date = this.gfv("date");
      const roomId = this.gfv("room");
      const atId = this.gfv("assignType");

      // Check that the selected at is of school type
      if (
        currentDate &&
        roomId &&
        atId &&
        this.assignTypeService.isOfTypeSchoolAssignTypes(
          this.assignTypeService.getAssignType(atId).type,
        )
      ) {
        //Get a list of principals that are not exhausted for school
        let principals =
          structuredClone(
            this.principals.filter((p) => !p.isCloseToOthers && !p.hasCollision && !p.hasWork),
          ) ?? [];

        if (principals.length) {
          //Get a list of assignments that are for school
          const assignments = this.assignments.filter((a) =>
            this.assignTypeService.isOfTypeSchoolAssignTypes(
              this.assignTypeService.getAssignType(a.assignType).type,
            ),
          );
          //As its a new array, reuse the count property to assign the global count
          for (const p of principals) {
            p.count = assignments.filter((a) => a.principal === p.id).length;
          }
          //Sort by count
          principals.sort((a, b) => (a.count > b.count ? 1 : -1));
          //Save the global count in case the icon is clicked
          this.starvingSchoolParticipants = principals;
          //Get the first participant and assign the starving to the others
          const lowestCount = principals[0].count;
          for (const p of principals) {
            if (p.count === lowestCount) {
              p.isStarvingSchool = true;
            }
          }
          //Get only the starving
          principals = principals.filter((p) => p.isStarvingSchool);

          //Get the id of the starving and assign it to the principals list
          for (const p of principals) {
            this.principals.find((p1) => p1.id === p.id).isStarvingSchool = true;
          }
        }
      }
    }
  }

  filterAssignmentsByRole() {
    //Filter assignTypes by permissions
    this.assignTypes = this.assignTypeService.getAssignTypes();

    //administrator is undefined value so this if doesnt apply and can view everything
    if (this.role) {
      this.assignTypes = this.assignTypes.filter((at) =>
        this.role.assignTypesId.includes(at.id),
      );
    }

    this.assignTypes.sort((a, b) => (a.order > b.order ? 1 : -1));
  }

  /**
   * Remove assignTypes that already exist in the selected date and room.
   * depends on: assignments, selected room, selected date
   */
  removeAssignTypesThatAlreadyExistOnDate() {
    if (!this.isUpdate && !this.isMultipleDates) {
      const dateValue = this.gfv("date");
      const roomValue = this.gfv("room");
      const assignTypeValue = this.gfv("assignType");
      this.noAvailableAssignTypesByRole = false;

      if (dateValue && roomValue) {
        const assignmentsByDate = this.assignmentService.getAssignmentsByDate(dateValue);

        this.assignTypes = this.assignTypes.filter(
          (at) =>
            !assignmentsByDate.some((a) => a.assignType === at.id && a.room === roomValue) ||
            Boolean(at.repeat),
        );

        //Reset if assignType selected not in new assignTypes
        if (!this.assignTypes.some((at) => at.id === assignTypeValue))
          this.form.get("assignType").reset(undefined, { emitEvent: false });

        if (!this.assignTypes.length) {
          this.noAvailableAssignTypesByRole = true;
          //Do not let the user click as there are no assign types
          this.form.get("assignType").markAsTouched();
        }
      }
    }
  }

  /**
   * Special characters that are not visual and are hidden, even for code editors.
   */
  removeGremlings() {
    const themeControl = this.form.get("theme");
    const value = themeControl.value;
    if (value)
      themeControl.patchValue(value.replace(/\u200B/g, ""), {
        emitEvent: false,
      });
  }

  onSubmit(event: Event): void {
    event.stopPropagation();
    this.removeGremlings();

    //update
    if (this.isUpdate) this.assignmentService.updateAssignment(this.form.getRawValue());

    //Multiple create
    if (this.isMultipleDates) {
      const assignmentsToSave = [];
      for (const d of this.selectedDates) {
        assignmentsToSave.push({
          ...this.form.value,
          date: d,
        });
      }
      this.assignmentService.createMultipleAssignments(assignmentsToSave);
    }
    //create
    if (!this.isUpdate && !this.isMultipleDates) {
      this.assignmentService.createAssignment(this.form.value);
    }

    //navigate to parent, one parent for each fragment
    const parentRoute = this.isUpdate ? "../.." : "..";
    this.router.navigate([parentRoute], {
      relativeTo: this.activatedRoute,
    });
  }

  submitAndCreate(event: Event): void {
    event.stopPropagation();
    this.removeGremlings();
    this.assignmentService.createAssignment(this.form.value);

    //Save current values
    const date = this.gfv("date");
    const sheetTitle = this.gfv("sheetTitle");
    const footerNote = this.gfv("footerNote");
    const room = this.gfv("room");
    const onlyMan = this.gfv("onlyMan");
    const onlyWoman = this.gfv("onlyWoman");
    const onlyExternals = this.gfv("onlyExternals");

    //Reset form
    this.form.reset({ emitEvent: false });

    //Restore values
    this.form.get("date").setValue(date, { emitEvent: false });
    this.form.get("sheetTitle").setValue(sheetTitle, { emitEvent: false });
    this.form.get("footerNote").setValue(footerNote, { emitEvent: false });
    this.form.get("room").setValue(room, { emitEvent: false });
    this.form.get("onlyMan").setValue(onlyMan, { emitEvent: false });
    this.form.get("onlyWoman").setValue(onlyWoman, { emitEvent: false });
    this.form.get("onlyExternals").setValue(onlyExternals, { emitEvent: false });
    this.form.get("group").setValue(0, { emitEvent: false });

    this.getParticipantsAvailableOnDate();

    //Reset assign types select
    this.filterAssignmentsByRole();
    this.removeAssignTypesThatAlreadyExistOnDate();
  }

  onSelectionChangePrincipal() {
    this.principalSelect.close();
    //Wait until button is enabled to focus it otherwise not works
    this.cdr.detectChanges();
    if (!this.isUpdate && !this.isMultipleDates) this.btnSaveCreateAnother.focus();
  }

  onSelectionChangeAssistant() {
    this.assistantSelect.close();
    if (!this.isUpdate && !this.isMultipleDates) this.btnSaveCreateAnother.focus();
  }

  getPrincipalName(principalId) {
    const principal = this.principals.find((p) => p.id === principalId);
    return principal?.name;
  }

  getAssistantName(assistantId) {
    const assistant = this.assistants.find((a) => a.id === assistantId);
    return assistant?.name;
  }

  /**
   * @param e the event, to prevent default
   * @param id the participant id
   */
  onPrincipalIconInfoClick(e: Event, participant: ParticipantDynamicInterface) {
    e.preventDefault();
    e.stopPropagation();
    //Get a list of participants for that date with that count with that role
    const principalsSameCount = this.principals.filter((p) => p.count === participant.count);
    this.matDialog.open(InfoAssignmentComponent, {
      data: principalsSameCount,
    });
  }

  onAssistantIconInfoClick(e: Event, participant: ParticipantDynamicInterface) {
    e.preventDefault();
    e.stopPropagation();
    //Get a list of participants for that date with that count with that role
    const assistantsSameCount = this.assistants.filter((p) => p.count === participant.count);
    this.matDialog.open(InfoAssignmentComponent, {
      data: assistantsSameCount,
    });
  }

  /**
   * @param e the event, to prevent default
   * @param id the participant id
   */
  onIconWarningClick(e: Event, participant: ParticipantDynamicInterface) {
    e.preventDefault();
    e.stopPropagation();

    const messageList: string[] = [];

    const participantAssignments = this.assignmentService.findAssignmentsByParticipantId(
      participant.id,
      this.gfv("date"),
    );

    for (const pa of participantAssignments) {
      messageList.push(
        this.roomService.getNameOrTranslation(this.roomService.getRoom(pa.room)) +
          " - " +
          this.assignTypeService.getNameOrTranslation(
            this.assignTypeService.getAssignType(pa.assignType),
          ),
      );
    }

    this.matDialog.open(WarningAssignmentComponent, {
      data: messageList,
    });
  }

  getBorderLeftStyle(color) {
    return `12px solid ${color ? color : "#FFF"}`;
  }

  onRedClockClick(e: Event, participant: ParticipantDynamicInterface) {
    e.preventDefault();
    e.stopPropagation();
    const assignments = this.getIfAboveThreshold(participant);
    this.matDialog.open(CloseAssignmentsComponent, {
      data: { assignments, isRedClock: true },
    });
  }

  onYellowClockSchoolClick(e: Event, participant: ParticipantDynamicInterface) {
    e.preventDefault();
    e.stopPropagation();
    const assignments = this.getExhaustedAssignmentsForSchool(participant);
    this.matDialog.open(CloseAssignmentsComponent, {
      data: { assignments, isRedClock: false },
    });
  }

  onYellowClockPrayerClick(e: Event, participant: ParticipantDynamicInterface) {
    e.preventDefault();
    e.stopPropagation();
    const assignments = this.getExhaustedAssignmentsForPrayer(participant);
    this.matDialog.open(CloseAssignmentsComponent, {
      data: { assignments, isRedClock: false },
    });
  }

  onYellowClockTreasuresEtcClick(e: Event, participant: ParticipantDynamicInterface) {
    e.preventDefault();
    e.stopPropagation();
    const assignments = this.getExhaustedAssignmentsForTreasuresEtc(participant);
    this.matDialog.open(CloseAssignmentsComponent, {
      data: { assignments, isRedClock: false },
    });
  }

  onStarvingSchoolClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    const starvingContext: StarvingAssignmentsDataContext = {
      participants: this.starvingSchoolParticipants,
      isSchool: true,
      isPrayer: false,
      isTreasuresEtc: false,
    };
    this.matDialog.open(StarvingAssignmentComponent, {
      data: starvingContext,
    });
  }

  //assignments for red clock window
  getIfAboveThreshold(p: ParticipantInterface): AssignmentInterface[] {
    let currentDate: Date = this.form.controls.date.value;
    const atId: string = this.form.controls.assignType.value;
    const assignType = this.assignTypeService.getAssignType(atId);
    /* get the threshold of the assign type itself */
    const days = assignType?.days;
    if (days) {
      //If we edit an assignment, we get the string iso instead of a real date
      if (typeof currentDate === "string") currentDate = parseISO(currentDate);

      //Get all the days before and after, its 1 based index
      let allDays: AssignmentInterface[] = [];
      for (let i = 1; i <= days; i++) {
        allDays = allDays.concat(
          this.assignmentService.getAssignmentsByDate(addDays(currentDate, i)),
        );
        allDays = allDays.concat(
          this.assignmentService.getAssignmentsByDate(subDays(currentDate, i)),
        );
      }
      const foundAssignments: AssignmentInterface[] = [];

      for (const a of allDays) {
        if (a.assignType === assignType.id && a.principal === p.id) {
          foundAssignments.push(a);
        }
      }
      return foundAssignments;
    }
  }
  //assignments for yellow clock window
  getExhaustedAssignmentsForSchool(p: ParticipantInterface) {
    let currentDate: Date = this.form.controls.date.value;
    const closeOthersDays = this.configService.getConfig().closeToOthersDays;

    //If we edit an assignment, we get the string iso instead of a real date
    if (typeof currentDate === "string") currentDate = parseISO(currentDate);

    //Get all the assignments before and after the days treshold, its 1 based index
    const allDays = this.assignmentService.getAllAssignmentsByDaysBeforeAndAfter(
      currentDate,
      closeOthersDays,
    );

    const foundAssignments: AssignmentInterface[] = [];
    for (const assign of allDays) {
      if (
        this.assignTypeService.isOfTypeSchoolAssignTypes(
          this.assignTypeService.getAssignType(assign.assignType).type,
        ) &&
        (assign.principal === p.id || assign.assistant === p.id)
      ) {
        foundAssignments.push(assign);
      }
    }
    return foundAssignments;
  }
  //assignments for yellow clock window
  getExhaustedAssignmentsForPrayer(p: ParticipantInterface) {
    let currentDate: Date = this.form.controls.date.value;
    const closeOthersPrayerDays = this.configService.getConfig().closeToOthersPrayerDays;

    //If we edit an assignment, we get the string iso instead of a real date
    if (typeof currentDate === "string") currentDate = parseISO(currentDate);

    //Get all the assignments before and after the days treshold, its 1 based index
    const allDays = this.assignmentService.getAllAssignmentsByDaysBeforeAndAfter(
      currentDate,
      closeOthersPrayerDays,
    );

    const foundAssignments: AssignmentInterface[] = [];
    for (const assign of allDays) {
      if (
        this.assignTypeService.isOfTypePrayer(
          this.assignTypeService.getAssignType(assign.assignType).type,
        ) &&
        (assign.principal === p.id || assign.assistant === p.id)
      ) {
        foundAssignments.push(assign);
      }
    }
    return foundAssignments;
  }
  //assignments for yellow clock window
  getExhaustedAssignmentsForTreasuresEtc(p: ParticipantInterface) {
    let currentDate: Date = this.form.controls.date.value;
    const closeOthersTreasuresEtcDays = this.configService.getConfig().closeToOthersPrayerDays;

    //If we edit an assignment, we get the string iso instead of a real date
    if (typeof currentDate === "string") currentDate = parseISO(currentDate);

    //Get all the assignments before and after the days treshold, its 1 based index
    const allDays = this.assignmentService.getAllAssignmentsByDaysBeforeAndAfter(
      currentDate,
      closeOthersTreasuresEtcDays,
    );

    const foundAssignments: AssignmentInterface[] = [];
    for (const assign of allDays) {
      if (
        this.assignTypeService.isOfTypeTreasuresAndOthers(
          this.assignTypeService.getAssignType(assign.assignType).type,
        ) &&
        (assign.principal === p.id || assign.assistant === p.id)
      ) {
        foundAssignments.push(assign);
      }
    }
    return foundAssignments;
  }

  //TIME DISTANCE BETWEEN LATEST AND SELECTED DATE

  getTimeDistance() {
    const assignTypeId = this.gfv("assignType");
    const selectedDate = this.gfv("date");

    //Clear first
    for (const p of this.participants) {
      p.isPrincipalLastAssignment = false;
      p.lastAssignmentDate = null;
      p.lastAssignType = null;
      p.distanceBetweenPenultimaAndLast = null;
    }

    if (this.gfv("onlySortByTime") && assignTypeId) {
      //Get the lastAssignmentDate
      const assignTypeObj = this.assignTypeService.getAssignType(assignTypeId);

      for (const participant of this.participants) {
        //If assignment is not part of a group, the last date must be specific to that assign type.
        //If it's part of a group, then just return the latest
        let assignTypeIdList = [];

        if (this.assignTypeService.isOfTypePrayer(assignTypeObj.type)) {
          for (const type of this.assignTypeService.getTypesForPrayer()) {
            assignTypeIdList.push(this.assignTypeService.getAssignTypeIdByType(type));
          }
        }
        if (this.assignTypeService.isOfTypeSchoolAssignTypes(assignTypeObj.type)) {
          for (const type of this.assignTypeService.getTypesForSchoolAssignTypes()) {
            assignTypeIdList.push(this.assignTypeService.getAssignTypeIdByType(type));
          }
        }
        if (this.assignTypeService.isOfTypeTreasuresAndOthers(assignTypeObj.type)) {
          for (const type of this.assignTypeService.getTypesForTreasuresAndOthers()) {
            assignTypeIdList.push(this.assignTypeService.getAssignTypeIdByType(type));
          }
        } else {
          // Means it's an assignment that doesnt belong to a group
          assignTypeIdList.push(
            this.assignTypeService.getAssignTypeIdByType(assignTypeObj.type),
          );
        }

        //Filter possible null values //ToDo: For compatibility, must be removed on v6
        assignTypeIdList = assignTypeIdList.filter((at) => at);

        const assignment = getLastPrincipalAssignment(
          this.assignments,
          participant,
          assignTypeIdList,
        );

        if (assignment) participant.isPrincipalLastAssignment = true;

        if (assignment) {
          participant.lastAssignmentDate = assignment.date;
          //Search the assignmentType and inject
          const aTypeObj = this.assignTypeService.getAssignType(assignment.assignType);
          participant.lastAssignType = this.assignTypeService.getNameOrTranslation(aTypeObj);
        }
      }

      //Get the distance, i18n sensitive
      this.sharedService.getDistanceBetweenPenultimaAndLast(
        this.participants,
        this.dateFnsLocaleService.locales[this.translocoService.getActiveLang()],
        selectedDate,
      );
    }
  }

  //********* DATEPICKER HACK *************

  //for Datepicker hack
  public dateClass = (date: Date) => {
    if (this.findDate(date) !== -1) {
      return ["selected"];
    }
    return [];
  };

  //for Datepicker hack
  public dateChanged(event: MatDatepickerInputEvent<Date>): void {
    if (event.value && this.timeoutExecuted) {
      this.timeoutExecuted = false;
      const date = event.value;
      //update last clicked date
      this.lastDateService.lastDate = date;
      const index = this.findDate(date);
      if (index === -1) {
        this.selectedDates.push(date);
      } else {
        this.selectedDates.splice(index, 1);
      }
      this.resetModel = new Date(0);
      //prepare sorted dates for the reports and new reference for the input components
      this.selectedDates = [...this.selectedDates.sort(this.sortService.sortDates)];

      if (!this.closeOnSelected) {
        const closeFn = this.datePickerRef.close;
        this.datePickerRef.close = () => {};
        // eslint-disable-next-line no-underscore-dangle
        this.datePickerRef[
          // eslint-disable-next-line @typescript-eslint/dot-notation
          "_componentRef"
        ].instance._calendar.monthView._createWeekCells();

        this.timeoutRef = setTimeout(() => {
          this.datePickerRef.close = closeFn;
          this.timeoutExecuted = true;
        });
      }
    }
    this.cdr.detectChanges();
  }

  //for Datepicker hack
  public remove(date: Date): void {
    const index = this.findDate(date);
    this.selectedDates.splice(index, 1);
  }

  //for Datepicker hack
  private findDate(date: Date): number {
    return this.selectedDates.map((m) => +m).indexOf(+date);
  }
}
