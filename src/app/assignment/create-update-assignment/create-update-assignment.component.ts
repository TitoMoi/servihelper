/* eslint-disable @typescript-eslint/prefer-for-of */
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { LastDateService } from "app/assignment/service/last-date.service";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
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
import { Subscription, map } from "rxjs";

import {
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
} from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatSelect } from "@angular/material/select";
import { ActivatedRoute, Router } from "@angular/router";
import { RoleInterface } from "app/roles/model/role.model";
import { MatDialog } from "@angular/material/dialog";
import { InfoAssignmentComponent } from "../info-assignment/info-assignment.component";
import { SortService } from "app/services/sort.service";
import { WarningAssignmentComponent } from "../warning-assignment/warning-assignment.component";
import {
  MatDatepicker,
  MatDatepickerInputEvent,
} from "@angular/material/datepicker";
import { MatCheckboxChange } from "@angular/material/checkbox";

@Component({
  selector: "app-create-update-assignment",
  templateUrl: "./create-update-assignment.component.html",
  styleUrls: ["./create-update-assignment.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateAssignmentComponent implements OnInit, OnDestroy {
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

  rooms: RoomInterface[] = this.roomService
    .getRooms()
    .sort((a, b) => (a.order > b.order ? 1 : -1));
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  //to filter available dates
  participants: ParticipantInterface[] = [];

  principals: ParticipantDynamicInterface[] = [];
  assistants: ParticipantDynamicInterface[] = [];
  footerNotes: NoteInterface[] = this.noteService.getNotes();
  assignments: AssignmentInterface[];

  assignmentsBySelectedDate: AssignmentInterface[] = [];

  role$ = this.configService.config$.pipe(
    map(() => this.configService.getRole(this.configService.getCurrentRole()))
  );

  role: RoleInterface;

  //Fill the form with the assignment passed by the router
  a: AssignmentInterface = this.assignmentService.getAssignment(
    this.activatedRoute.snapshot.params.id
  );

  isUpdate = this.a !== undefined;
  //FORM Update or create
  form: UntypedFormGroup = this.formBuilder.group({
    id: this.a ? this.a.id : undefined,
    date: [
      {
        value: this.a ? this.a.date : undefined,
        disabled: this.a ? true : false,
      },
      Validators.required,
    ],
    room: [
      //Room id
      {
        value: this.a ? this.a.room : undefined,
        disabled: this.a ? true : false,
      },
      Validators.required,
    ],
    assignType: [
      //AssignType id
      {
        value: this.a ? this.a.assignType : undefined,
        disabled: this.a ? true : false,
      },
      Validators.required,
    ],
    theme: this.a ? this.a.theme : "",
    onlyWoman: [this.a ? this.a.onlyWoman : false],
    onlyMan: [this.a ? this.a.onlyMan : false],
    onlyExternals: [this.a ? this.a.onlyExternals : false],
    principal: [this.a ? this.a.principal : undefined, Validators.required], //participant id
    assistant: [this.a ? this.a.assistant : undefined], //participant id
    footerNote: this.a
      ? this.a.footerNote
      : this.configService.getConfig().defaultFooterNoteId, //Note id
  });

  //Subscriptions
  subscription: Subscription = new Subscription();

  constructor(
    public lastDateService: LastDateService,
    private formBuilder: UntypedFormBuilder,
    private assignmentService: AssignmentService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private noteService: NoteService,
    private configService: ConfigService,
    private sharedService: SharedService,
    private sortService: SortService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private matDialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.getAssignments();
  }

  ngOnInit() {
    //Get the view values
    if (this.isUpdate) {
      this.getParticipantsAvailableOnDate();
      this.batchGetCountSortWarning();
      this.removePrincipalFromAssistants(this.gfv("principal"));
      this.enableOrDisableAssistantControl(this.gfv("assignType"));
    }

    //Prepare the form changes
    this.prepareRole();
    this.prepareDateSub();
    this.prepareRoomSub();
    this.prepareAssignTypeSub();
    this.prepareOnlyManSub();
    this.prepareOnlyWomanSub();
    this.prepareOnlyExternalsSub();
    this.preparePrincipalSub();
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

  /**
   * @param formControlName the form control name to get the value
   * @returns the value for the form control
   */
  gfv(formControlName: string) {
    return this.form.get(formControlName).value;
  }

  prepareRole() {
    this.subscription.add(
      this.role$.subscribe((r) => {
        this.role = r;
        this.filterAssignmentsByRole();
        this.removeAssignTypesThatAlreadyExistOnDate();
      })
    );
  }

  /** (view) Set count and last assignment date for principals */
  setPrincipalsCountAndLastDate() {
    if (!this.isMultipleDates) {
      this.sharedService.setCountAndLastAssignmentDate(
        this.assignments,
        this.principals,
        this.gfv("room"),
        this.gfv("assignType"),
        true
      );
    }
  }

  /** (view) Set count and last assignment date for assistants */
  setAssistantsCountAndLastDate() {
    if (!this.isMultipleDates) {
      this.sharedService.setCountAndLastAssignmentDate(
        this.assignments,
        this.assistants,
        this.gfv("room"),
        this.gfv("assignType"),
        false
      );
    }
  }

  /** Batch operation
   */
  batchGetCountSortWarning() {
    this.getPrincipalAndAssistant();
    this.setPrincipalsCountAndLastDate();
    this.setAssistantsCountAndLastDate();
    this.principals.sort(this.sortService.sortParticipantsByCountOrDate);
    this.assistants.sort(this.sortService.sortParticipantsByCountOrDate);
    this.warningIfAlreadyHasWork();
  }

  prepareDateSub() {
    this.subscription = this.form.get("date").valueChanges.subscribe((date) => {
      this.lastDateService.lastDate = date;

      this.batchCleanPrincipalAssistant();
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
        this.filterAssignmentsByRole();
        this.removeAssignTypesThatAlreadyExistOnDate();
        this.batchGetCountSortWarning();
      })
    );
    this.cdr.detectChanges();
  }

  prepareAssignTypeSub() {
    this.subscription.add(
      this.form
        .get("assignType")
        .valueChanges.subscribe((assignTypeId: string) => {
          this.batchCleanPrincipalAssistant();
          this.batchGetCountSortWarning();
          this.enableOrDisableAssistantControl(assignTypeId);
        })
    );
    this.cdr.detectChanges();
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

        if (!onlyMan) {
          this.batchGetCountSortWarning();
          return;
        }
        //Only man
        this.principals = this.principals.filter(
          (p) => p.isWoman === false && !p.isExternal
        );
        this.assistants = this.assistants.filter(
          (a) => a.isWoman === false && !a.isExternal
        );
      })
    );
  }

  prepareOnlyWomanSub() {
    this.subscription.add(
      this.form.get("onlyWoman").valueChanges.subscribe((onlyWoman) => {
        this.batchCleanPrincipalAssistant();

        if (!onlyWoman) {
          this.batchGetCountSortWarning();
          return;
        }
        //Only woman
        this.principals = this.principals.filter((p) => p.isWoman === true);
        this.assistants = this.assistants.filter((a) => a.isWoman === true);
      })
    );
  }

  prepareOnlyExternalsSub() {
    this.subscription.add(
      this.form.get("onlyExternals").valueChanges.subscribe((onlyExternals) => {
        this.batchCleanPrincipalAssistant();

        if (!onlyExternals) {
          this.batchGetCountSortWarning();
          return;
        }
        //Only externals
        this.principals = this.principals.filter((p) => p.isExternal);
        this.assistants = this.assistants.filter((p) => p.isExternal);
      })
    );
  }

  preparePrincipalSub() {
    this.subscription.add(
      this.form.get("principal").valueChanges.subscribe((principalId) => {
        //remove selected principal from assistants
        this.removePrincipalFromAssistants(principalId);
      })
    );
  }

  removePrincipalFromAssistants(principalId: string) {
    if (principalId) {
      let i = this.assistants.length;
      while (i--) {
        if (this.assistants[i].id === principalId) {
          this.assistants.splice(i, 1);
          break;
        }
      }
    }
  }

  /** (Form) clean principalId and assistantId */
  batchCleanPrincipalAssistant() {
    this.form.get("principal").reset(undefined, { emitEvent: false });
    this.form.get("assistant").reset(undefined, { emitEvent: false });
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
        this.gfv("onlyWoman")
      );

      this.assistants = this.sharedService.filterAssistantsByAvailable(
        structuredClone(this.participants),
        this.gfv("assignType"),
        this.gfv("room"),
        this.gfv("onlyMan"),
        this.gfv("onlyWoman")
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
          (date) =>
            new Date(dateControlValue).getTime() === new Date(date).getTime()
        )
    );
  }

  /**
   * Highlight the principal or assistant if already has work
   */
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

  filterAssignmentsByRole() {
    //Filter assignTypes by permissions
    this.assignTypes = this.assignTypeService.getAssignTypes();

    //administrator is undefined value
    if (this.role) {
      this.assignTypes = this.assignTypes.filter((at) =>
        this.role.assignTypesId.includes(at.id)
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

      if (dateValue && roomValue) {
        const assignmentsByDate =
          this.assignmentService.getAssignmentsByDate(dateValue);

        this.assignTypes = this.assignTypes.filter(
          (at) =>
            !assignmentsByDate.some(
              (a) => a.assignType === at.id && a.room === roomValue
            )
        );

        //Reset if assignType selected not in new assignTypes
        if (!this.assignTypes.some((at) => at.id === assignTypeValue))
          this.form.get("assignType").reset(undefined, { emitEvent: false });
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
    if (this.isUpdate)
      this.assignmentService.updateAssignment(this.form.getRawValue());

    //Multiple create
    if (this.isMultipleDates) {
      const assignmentsToSave = [];
      this.selectedDates.forEach((d) => {
        assignmentsToSave.push({
          ...this.form.value,
          date: d,
        });
      });
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
    const footerNote = this.gfv("footerNote");
    const room = this.gfv("room");
    const onlyMan = this.gfv("onlyMan");
    const onlyWoman = this.gfv("onlyWoman");
    const onlyExternals = this.gfv("onlyExternals");

    //Reset form
    this.form.reset();

    //Restore values
    this.form.get("date").setValue(date, { emitEvent: false });
    this.form.get("footerNote").setValue(footerNote, { emitEvent: false });
    this.form.get("room").setValue(room, { emitEvent: false });
    this.form.get("onlyMan").setValue(onlyMan, { emitEvent: false });
    this.form.get("onlyWoman").setValue(onlyWoman, { emitEvent: false });
    this.form
      .get("onlyExternals")
      .setValue(onlyExternals, { emitEvent: false });

    this.getParticipantsAvailableOnDate();

    //Reset assign types select
    this.filterAssignmentsByRole();
    this.removeAssignTypesThatAlreadyExistOnDate();
  }

  onSelectionChangePrincipal() {
    this.principalSelect.close();
    //Wait until button is enabled to focus it otherwise not works
    this.cdr.detectChanges();
    if (!this.isUpdate && !this.isMultipleDates)
      this.btnSaveCreateAnother.focus();
  }

  onSelectionChangeAssistant() {
    this.assistantSelect.close();
    if (!this.isUpdate && !this.isMultipleDates)
      this.btnSaveCreateAnother.focus();
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
    //Get a list of participants for that date with that count
    const principalsSameCount = this.principals.filter(
      (p) => p.count === participant.count
    );
    this.matDialog.open(InfoAssignmentComponent, {
      data: principalsSameCount,
    });
  }

  /**
   * @param e the event, to prevent default
   * @param id the participant id
   */
  onPrincipalIconWarningClick(
    e: Event,
    participant: ParticipantDynamicInterface
  ) {
    e.preventDefault();
    e.stopPropagation();

    const messageList: string[] = [];

    const participantAssignments =
      this.assignmentService.findAssignmentsByParticipantId(
        participant.id,
        this.gfv("date")
      );

    participantAssignments.forEach((pa) => {
      messageList.push(
        this.roomService.getRoomNameById(pa.room) +
          " - " +
          this.assignTypeService.getAssignTypeNameById(pa.assignType)
      );
    });

    this.matDialog.open(WarningAssignmentComponent, {
      data: messageList,
    });
  }

  getBorderLeftStyle(color) {
    return `10px solid ${color ? color : "#FFF"}`;
  }

  /**
   * @param index the index
   * @param participant the participant to compare
   * @returns the id of the participant
   */
  trackByIdFn(index, participant: ParticipantInterface) {
    return participant.id;
  }

  trackByIdRoomFn(index, room: RoomInterface) {
    return room.id;
  }

  trackByIdAssignTypeFn(index, assignType: AssignTypeInterface) {
    return assignType.id;
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
      this.selectedDates = [
        ...this.selectedDates.sort(this.sharedService.sortDates),
      ];

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
