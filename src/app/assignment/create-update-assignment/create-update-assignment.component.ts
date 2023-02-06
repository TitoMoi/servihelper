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
    map((config) =>
      this.configService.getRole(this.configService.getCurrentRole())
    )
  );

  role: RoleInterface;

  //Fill the form with the assignment passed by the router
  a: AssignmentInterface = this.assignmentService.getAssignment(
    this.activatedRoute.snapshot.params.id
  );

  isUpdate = this.a !== undefined;

  //Update or create
  assignmentForm: UntypedFormGroup = this.formBuilder.group({
    id: this.a ? this.a.id : undefined,
    date: [this.a ? this.a.date : undefined, Validators.required],
    room: [this.a ? this.a.room : undefined, Validators.required], //Room id
    assignType: [this.a ? this.a.assignType : undefined, Validators.required], //AssignType id
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

  async getAssignments() {
    this.assignments = await this.assignmentService.getAssignments();
  }
  /**
   *
   * @param formControlName the form control name to get the value
   * @returns the value for the form control
   */
  gfv(formControlName) {
    return this.assignmentForm.get(formControlName).value;
  }

  ngOnInit() {
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

  prepareRole() {
    this.subscription.add(
      this.role$.subscribe((r) => {
        this.role = r;

        //If date and room are selected, when click the assignTypes select is not working, so we need to call it manually
        if (this.gfv("date") && this.gfv("room")) {
          this.removeAssignTypesThatAlreadyExistOnDate();
        }
      })
    );
  }

  setPrincipalsCountAndLastDate() {
    this.sharedService.setCountAndLastAssignmentDate(
      this.assignments,
      this.principals,
      this.gfv("room"),
      this.gfv("assignType"),
      true
    );
  }

  setAssistantsCountAndLastDate() {
    //Set count for assistants
    this.sharedService.setCountAndLastAssignmentDate(
      this.assignments,
      this.assistants,
      this.gfv("room"),
      this.gfv("assignType"),
      false
    );
  }

  //Batch function
  getCountSortAndHighlightProcess() {
    this.getPrincipalAndAssistant();
    //Set count for principals
    this.setPrincipalsCountAndLastDate();
    //Set count for assistants
    this.setAssistantsCountAndLastDate();

    this.principals = this.principals.sort(
      this.sortService.sortParticipantsByCountOrDate
    );
    this.assistants.sort(this.sortService.sortParticipantsByCountOrDate);
    this.warningIfAlreadyHasWork();
  }

  prepareDateSub() {
    this.subscription = this.assignmentForm
      .get("date")
      .valueChanges.subscribe((date) => {
        this.lastDateService.lastDate = date;

        this.cleanPrincipalAndAssistant();

        if (this.gfv("date")) {
          this.checkAvailableDates();
        }

        if (this.gfv("room")) {
          this.removeAssignTypesThatAlreadyExistOnDate();
        }
        if (this.gfv("room") && this.gfv("assignType")) {
          this.getPrincipalAndAssistant();

          //Set count for principals
          this.setPrincipalsCountAndLastDate();

          //Set count for assistants
          this.setAssistantsCountAndLastDate();

          this.principals.sort(this.sortService.sortParticipantsByCountOrDate);
          this.assistants.sort(this.sortService.sortParticipantsByCountOrDate);
        }
      });
    this.cdr.detectChanges();
  }

  prepareRoomSub() {
    this.subscription.add(
      this.assignmentForm.get("room").valueChanges.subscribe((room) => {
        this.cleanPrincipalAndAssistant();

        if (this.gfv("date")) {
          this.removeAssignTypesThatAlreadyExistOnDate();
        }
        if (this.gfv("date") && this.gfv("assignType")) {
          this.getPrincipalAndAssistant();

          //Set count for principals
          this.setPrincipalsCountAndLastDate();

          //Set count for assistants
          this.setAssistantsCountAndLastDate();

          this.principals.sort(this.sortService.sortParticipantsByCountOrDate);
          this.assistants.sort(this.sortService.sortParticipantsByCountOrDate);
        }
      })
    );
    this.cdr.detectChanges();
  }

  prepareAssignTypeSub() {
    this.subscription.add(
      this.assignmentForm
        .get("assignType")
        .valueChanges.subscribe((assignType) => {
          this.cleanPrincipalAndAssistant();

          if (this.gfv("date") && this.gfv("room") && this.gfv("assignType")) {
            this.getPrincipalAndAssistant();

            //Set count for principals
            this.setPrincipalsCountAndLastDate();

            //Set count for assistants
            this.setAssistantsCountAndLastDate();

            this.principals.sort(
              this.sortService.sortParticipantsByCountOrDate
            );

            this.assistants.sort(
              this.sortService.sortParticipantsByCountOrDate
            );
          }
        })
    );
    this.cdr.detectChanges();
  }

  prepareOnlyManSub() {
    this.subscription.add(
      this.assignmentForm.get("onlyMan").valueChanges.subscribe((onlyMan) => {
        this.assignmentForm
          .get("principal")
          .reset(undefined, { emitEvent: false });
        this.assignmentForm
          .get("assistant")
          .reset(undefined, { emitEvent: false });

        if (!onlyMan) {
          this.getCountSortAndHighlightProcess();
          return;
        }
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
      this.assignmentForm
        .get("onlyWoman")
        .valueChanges.subscribe((onlyWoman) => {
          this.assignmentForm
            .get("principal")
            .reset(undefined, { emitEvent: false });
          this.assignmentForm
            .get("assistant")
            .reset(undefined, { emitEvent: false });

          if (!onlyWoman) {
            this.getCountSortAndHighlightProcess();
            return;
          }
          this.principals = this.principals.filter((p) => p.isWoman === true);
          this.assistants = this.assistants.filter((a) => a.isWoman === true);
        })
    );
  }

  prepareOnlyExternalsSub() {
    this.subscription.add(
      this.assignmentForm
        .get("onlyExternals")
        .valueChanges.subscribe((onlyExternals) => {
          this.assignmentForm
            .get("principal")
            .reset(undefined, { emitEvent: false });
          this.assignmentForm
            .get("assistant")
            .reset(undefined, { emitEvent: false });

          if (!onlyExternals) {
            this.getCountSortAndHighlightProcess();
            return;
          }

          this.principals = this.principals.filter((p) => p.isExternal);
          this.assistants = this.assistants.filter((p) => p.isExternal);
        })
    );
  }

  preparePrincipalSub() {
    this.subscription.add(
      this.assignmentForm
        .get("principal")
        .valueChanges.subscribe((principalId) => {
          //remove selected principal from assistants
          let i = this.assistants.length;
          while (i--) {
            if (this.assistants[i].id === principalId) {
              this.assistants.splice(i, 1);
              break;
            }
          }
        })
    );
  }

  cleanPrincipalAndAssistant() {
    this.assignmentForm.get("principal").reset(undefined, { emitEvent: false });
    this.assignmentForm.get("assistant").reset(undefined, { emitEvent: false });

    this.principals = [];
    this.assistants = [];
  }

  getPrincipalAndAssistant() {
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

  /**
   * Filter available participants by selected date and create a map of assignments by selected date.
   */
  checkAvailableDates() {
    this.participants = this.participantService
      .getParticipants(true)
      .filter(
        (p) =>
          !p.notAvailableDates.some(
            (date) =>
              new Date(this.gfv("date")).getTime() === new Date(date).getTime()
          )
      );
  }

  /**
   * Highlight the principal or assistant if already has work
   */
  warningIfAlreadyHasWork() {
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

  /**
   * Remove assignTypes that already exist in the selected date and room.
   * depends on: assignments, selected room, selected date
   *
   * This method doesnt trigger on update assignment because admin user can select any assignment while updating
   */
  removeAssignTypesThatAlreadyExistOnDate() {
    //Filter assignTypes by permissions
    this.assignTypes = this.assignTypeService.getAssignTypes();

    //administrator is undefined
    if (this.role) {
      this.assignTypes = this.assignTypes.filter((at) =>
        this.role.assignTypesId.includes(at.id)
      );
    }

    this.assignTypes = this.assignTypes.sort((a, b) =>
      a.order > b.order ? 1 : -1
    );

    const dateValue = this.gfv("date");
    const roomValue = this.gfv("room");
    const assignTypeValue = this.gfv("assignType");

    this.assignTypes = this.assignTypes.filter((at) => {
      let exists = false;

      for (const a of this.assignmentService.getAssignmentsByDate(dateValue)) {
        if (a.assignType === at.id && a.room === roomValue) {
          exists = true;
          break;
        }
      }
      return exists;
    });
    //Reset if assignType selected not in new assignTypes
    if (!this.assignTypes.some((at) => at.id === assignTypeValue))
      this.assignmentForm
        .get("assignType")
        .reset(undefined, { emitEvent: false });
  }

  /**
   * Special characters that are not visual and are hidden, even for code editors.
   */
  removeGremlings() {
    const themeControl = this.assignmentForm.get("theme");
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
      this.assignmentService.updateAssignment(
        this.assignmentForm.getRawValue()
      );
    //create
    else this.assignmentService.createAssignment(this.assignmentForm.value);

    //navigate to parent, one parent for each fragment
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }

  submitAndCreate(event: Event): void {
    event.stopPropagation();
    this.removeGremlings();
    this.assignmentService.createAssignment(this.assignmentForm.value);

    const date = this.gfv("date");
    const footerNote = this.gfv("footerNote");
    const room = this.gfv("room");
    const onlyMan = this.gfv("onlyMan");
    const onlyWoman = this.gfv("onlyWoman");
    const onlyExternals = this.gfv("onlyExternals");

    this.assignmentForm.reset(
      {
        id: undefined,
        date: [undefined, Validators.required],
        room: [undefined, Validators.required], //Room id
        assignType: [undefined, Validators.required], //AssignType id
        theme: "",
        onlyWoman: [false],
        onlyMan: [false],
        onlyExternals: [false],
        principal: [undefined, Validators.required], //participant id
        assistant: [undefined], //participant id
        footerNote: this.configService.getConfig().defaultFooterNoteId, //Note id
      },
      { emitEvent: false }
    );

    this.assignmentForm.get("date").setValue(date, { emitEvent: false });
    this.assignmentForm
      .get("footerNote")
      .setValue(footerNote, { emitEvent: false });
    this.assignmentForm.get("room").setValue(room, { emitEvent: false });
    this.assignmentForm.get("onlyMan").setValue(onlyMan, { emitEvent: false });
    this.assignmentForm
      .get("onlyWoman")
      .setValue(onlyWoman, { emitEvent: false });
    this.assignmentForm
      .get("onlyExternals")
      .setValue(onlyExternals, { emitEvent: false });

    //
    this.checkAvailableDates();

    //Reset assign types select
    this.removeAssignTypesThatAlreadyExistOnDate();
  }

  /** Focus */
  onSelectionChangePrincipal() {
    this.principalSelect.close();
    //Wait until button is enabled to focus it otherwise not works
    this.cdr.detectChanges();
    this.btnSaveCreateAnother.focus();
  }

  /** Focus */
  onSelectionChangeAssistant() {
    this.assistantSelect.close();
    this.btnSaveCreateAnother.focus();
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
    return `10px solid ${color}`;
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
}
