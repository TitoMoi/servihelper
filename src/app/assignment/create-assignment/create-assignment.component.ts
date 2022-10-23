/* eslint-disable @typescript-eslint/prefer-for-of */
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { LastDateService } from "app/assignment/service/last-date.service";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ConfigService } from "app/config/service/config.service";
import { sortParticipantsByCount } from "app/functions";
import { setCount } from "app/functions/setCount";
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
import { Subscription, of } from "rxjs";

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatSelect } from "@angular/material/select";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-create-assignment",
  templateUrl: "./create-assignment.component.html",
  styleUrls: ["./create-assignment.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAssignmentComponent implements OnInit, OnDestroy {
  @ViewChild("principalSelect") principalSelect: MatSelect;
  @ViewChild("assistantSelect") assistantSelect: MatSelect;
  @ViewChild("btnSaveCreateAnother") btnSaveCreateAnother: MatButton;

  rooms: RoomInterface[] = this.roomService
    .getRooms()
    .sort((a, b) => (a.order > b.order ? 1 : -1));
  assignTypes: AssignTypeInterface[] = [];

  //For filter available dates
  participants: ParticipantInterface[] = [];

  principals: ParticipantDynamicInterface[] = [];
  assistants: ParticipantDynamicInterface[] = [];
  footerNotes: NoteInterface[] = this.noteService.getNotes();
  assignments: AssignmentInterface[];

  assignmentsBySelectedDate: AssignmentInterface[] = [];

  assignmentForm: FormGroup = this.formBuilder.group({
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
  });

  //Subscriptions
  subscription: Subscription;

  constructor(
    public lastDateService: LastDateService,
    private formBuilder: FormBuilder,
    private assignmentService: AssignmentService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private noteService: NoteService,
    private configService: ConfigService,
    private sharedService: SharedService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
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

  setPrincipalsCount() {
    setCount(
      this.assignments,
      this.principals,
      this.gfv("room"),
      this.gfv("assignType"),
      true
    );
  }

  setAssistantsCount() {
    //Set count for assistants
    setCount(
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
    this.setPrincipalsCount();
    //Set count for assistants
    this.setAssistantsCount();
    this.principals.sort(sortParticipantsByCount);
    this.assistants.sort(sortParticipantsByCount);
    this.highlightIfAlreadyHasWork();
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
          this.removeAssignTypesThatAlreadyExistOnAssignment();
        }
        if (this.gfv("room") && this.gfv("assignType")) {
          this.getPrincipalAndAssistant();

          //Set count for principals
          this.setPrincipalsCount();

          //Set count for assistants
          this.setAssistantsCount();

          this.principals.sort(sortParticipantsByCount);
          this.assistants.sort(sortParticipantsByCount);
        }
      });
    this.cdr.detectChanges();
  }

  prepareRoomSub() {
    this.subscription.add(
      this.assignmentForm.get("room").valueChanges.subscribe((room) => {
        this.cleanPrincipalAndAssistant();

        if (this.gfv("date")) {
          this.removeAssignTypesThatAlreadyExistOnAssignment();
        }
        if (this.gfv("date") && this.gfv("assignType")) {
          this.getPrincipalAndAssistant();

          //Set count for principals
          this.setPrincipalsCount();

          //Set count for assistants
          this.setAssistantsCount();

          this.principals.sort(sortParticipantsByCount);
          this.assistants.sort(sortParticipantsByCount);
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
            this.setPrincipalsCount();

            //Set count for assistants
            this.setAssistantsCount();

            this.principals.sort(sortParticipantsByCount);
            this.assistants.sort(sortParticipantsByCount);
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
        this.principals = this.principals.filter((p) => p.isWoman === false);
        this.assistants = this.assistants.filter((a) => a.isWoman === false);
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
   * Highlight the participant if already has work
   */
  highlightIfAlreadyHasWork() {
    const dateValue = this.gfv("date");
    const room = this.gfv("room");
    const assignType = this.gfv("assignType");

    if (dateValue && room && assignType) {
      const principalsMap: Map<string, ParticipantDynamicInterface> = new Map();

      for (const p of this.principals) {
        principalsMap.set(p.id, p);
      }
      for (const p of this.principals) {
        const hasWork = this.assignmentService
          .getAssignmentsByDate(dateValue)
          .some((a) => a.principal === p.id || a.assistant === p.id);
        p.hasWork = hasWork;
      }

      for (const as of this.assistants) {
        const p = principalsMap.get(as.id);
        if (p && p.hasWork) {
          as.hasWork = true;
        }
      }
    }
  }

  /**
   * Remove assignTypes from select that already have assignment in the selected room
   * this piece of code is separated due to in create assignment must be rerun after submitAndCreate
   * depends on: assignments, selected room, selected date
   *
   * This method doesnt exist on update assignment because can be selected any assignment while updating
   */
  removeAssignTypesThatAlreadyExistOnAssignment() {
    this.assignTypes = this.assignTypeService
      .getAssignTypes()
      .sort((a, b) => (a.order > b.order ? 1 : -1));

    const dateValue = this.gfv("date");
    const roomValue = this.gfv("room");
    const assignTypeValue = this.gfv("assignType");

    this.assignTypes = this.assignTypes.filter((at) => {
      let notExists = true;

      for (const a of this.assignmentService.getAssignmentsByDate(dateValue)) {
        if (a.assignType === at.id && a.room === roomValue) {
          notExists = false;
          break;
        }
      }
      return notExists;
    });
    //Reset if assignType selected not in new assignTypes
    if (!this.assignTypes.some((at) => at.id === assignTypeValue))
      this.assignmentForm.get("assignType").reset(undefined);
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
    this.assignmentService.createAssignment(this.assignmentForm.value);

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
    this.removeAssignTypesThatAlreadyExistOnAssignment();
  }

  onSelectionChangePrincipal() {
    this.principalSelect.close();
    //Wait until button is enabled to focus it otherwise not works
    this.cdr.detectChanges();
    this.btnSaveCreateAnother.focus();
  }

  onSelectionChangeAssistant() {
    this.assistantSelect.close();
    this.btnSaveCreateAnother.focus();
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
