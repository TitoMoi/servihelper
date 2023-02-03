/* eslint-disable @typescript-eslint/prefer-for-of */
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
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
import { Subscription } from "rxjs";

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { SortService } from "app/services/sort.service";

@Component({
  selector: "app-update-assignment",
  templateUrl: "./update-assignment.component.html",
  styleUrls: ["./update-assignment.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateAssignmentComponent implements OnInit, OnDestroy {
  rooms: RoomInterface[] = this.roomService
    .getRooms()
    .sort((a, b) => (a.order > b.order ? 1 : -1));
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  //For filter available dates
  participants: ParticipantInterface[] = [];

  principals: ParticipantDynamicInterface[] = [];
  assistants: ParticipantDynamicInterface[] = [];

  footerNotes: NoteInterface[] = this.noteService.getNotes();
  assignments: AssignmentInterface[];

  //Fill the form with the assignment passed by the router
  assignment: AssignmentInterface = this.assignmentService.getAssignment(
    this.activatedRoute.snapshot.params.id
  );

  assignmentForm: UntypedFormGroup = this.formBuilder.group({
    id: this.assignment.id,
    date: [
      { value: this.assignment.date, disabled: true },
      Validators.required,
    ],
    room: [this.assignment.room, Validators.required], //Room id
    assignType: [this.assignment.assignType, Validators.required], //AssignType id
    theme: this.assignment.theme,
    onlyWoman: [this.assignment.onlyWoman],
    onlyMan: [this.assignment.onlyMan],
    onlyExternals: [this.assignment.onlyMan || false],
    principal: [this.assignment.principal, Validators.required], //participant id
    assistant: [this.assignment.assistant], //participant id
    footerNote: this.assignment.footerNote, //Note id
  });

  //Subscriptions
  subscription: Subscription = new Subscription();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private assignmentService: AssignmentService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private noteService: NoteService,
    private sharedService: SharedService,
    private sortService: SortService,
    private router: Router,
    private activatedRoute: ActivatedRoute
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

    this.checkAvailableDates();

    this.getCountSortAndHighlightProcess();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  setPrincipalsCount() {
    this.sharedService.setCountAndLastAssignmentDate(
      this.assignments,
      this.principals,
      this.gfv("room"),
      this.gfv("assignType"),
      true
    );
  }

  setAssistantsCount() {
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
    this.setPrincipalsCount();
    //Set count for assistants
    this.setAssistantsCount();
    this.principals.sort(this.sortService.sortParticipantsByCountOrDate);
    this.assistants.sort(this.sortService.sortParticipantsByCountOrDate);
    this.warningIfAlreadyHasWork();
  }

  prepareDateSub() {
    this.subscription = this.assignmentForm
      .get("date")
      .valueChanges.subscribe((date) => {
        this.assignmentForm
          .get("principal")
          .reset(undefined, { emitEvent: false });
        this.assignmentForm
          .get("assistant")
          .reset(undefined, { emitEvent: false });

        if (this.gfv("date")) {
          this.checkAvailableDates();
        }

        if (this.gfv("room") && this.gfv("assignType")) {
          this.getPrincipalAndAssistant();

          //Set count for principals
          this.setPrincipalsCount();

          //Set count for assistants
          this.setAssistantsCount();

          this.principals.sort(this.sortService.sortParticipantsByCountOrDate);
          this.assistants.sort(this.sortService.sortParticipantsByCountOrDate);
        }
      });
  }

  prepareRoomSub() {
    this.subscription.add(
      this.assignmentForm.get("room").valueChanges.subscribe((room) => {
        this.assignmentForm
          .get("principal")
          .reset(undefined, { emitEvent: false });
        this.assignmentForm
          .get("assistant")
          .reset(undefined, { emitEvent: false });

        if (this.gfv("date") && this.gfv("assignType")) {
          this.getPrincipalAndAssistant();

          //Set count for principals
          this.setPrincipalsCount();

          //Set count for assistants
          this.setAssistantsCount();

          this.principals.sort(this.sortService.sortParticipantsByCountOrDate);
          this.assistants.sort(this.sortService.sortParticipantsByCountOrDate);
        }
      })
    );
  }

  prepareAssignTypeSub() {
    this.subscription.add(
      this.assignmentForm
        .get("assignType")
        .valueChanges.subscribe((assignType) => {
          this.assignmentForm
            .get("principal")
            .reset(undefined, { emitEvent: false });
          this.assignmentForm
            .get("assistant")
            .reset(undefined, { emitEvent: false });

          if (this.gfv("date") && this.gfv("room")) {
            this.getPrincipalAndAssistant();

            //Set count for principals
            this.setPrincipalsCount();

            //Set count for assistants
            this.setAssistantsCount();

            this.principals.sort(
              this.sortService.sortParticipantsByCountOrDate
            );
            this.assistants.sort(
              this.sortService.sortParticipantsByCountOrDate
            );
          }
        })
    );
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

  checkAvailableDates() {
    this.participants = this.participantService.getParticipants();
    this.participants = this.participants.filter(
      (p) =>
        !p.notAvailableDates.some(
          (date) =>
            new Date(this.gfv("date")).getTime() === new Date(date).getTime()
        )
    );
    this.warningIfAlreadyHasWork();
  }

  /**
   * Highlight the participant if already has work
   */
  warningIfAlreadyHasWork() {
    const dateValue = this.gfv("date");
    const room = this.gfv("room");
    const assignType = this.gfv("assignType");

    const principalsMap: Map<string, ParticipantDynamicInterface> = new Map();

    if (dateValue && room && assignType) {
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
    this.assignmentService.updateAssignment(this.assignmentForm.getRawValue());

    //navigate to parent, one parent for each fragment
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
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
