/* eslint-disable @typescript-eslint/prefer-for-of */
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { sortParticipantsByCount } from "app/functions";
import { setCount } from "app/functions/setCount";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { ParticipantInterface } from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";
import { SharedService } from "app/services/shared.service";
import { filter, pairwise, startWith, Subscription } from "rxjs";

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-update-assignment",
  templateUrl: "./update-assignment.component.html",
  styleUrls: ["./update-assignment.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateAssignmentComponent implements OnInit, OnDestroy {
  rooms: RoomInterface[] = this.roomService
    .getRooms()
    .sort((a, b) => (a.order > b.order ? 1 : -1));
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));
  principals: ParticipantInterface[] = [];
  assistants: ParticipantInterface[] = [];
  footerNotes: NoteInterface[] = this.noteService.getNotes();
  assignments: AssignmentInterface[] = this.assignmentService.getAssignments();

  principalsBK: ParticipantInterface[] = [];
  assistantsBK: ParticipantInterface[] = [];

  //Fill the form with the assignment passed by the router
  assignment: AssignmentInterface = this.assignmentService.getAssignment(
    this.activatedRoute.snapshot.params.id
  );

  assignmentForm: FormGroup = this.formBuilder.group({
    id: this.assignment.id,
    date: [this.assignment.date, Validators.required],
    room: [this.assignment.room, Validators.required], //Room id
    assignType: [this.assignment.assignType, Validators.required], //AssignType id
    theme: this.assignment.theme,
    onlyWoman: [this.assignment.onlyWoman],
    onlyMan: [this.assignment.onlyMan],
    principal: [this.assignment.principal, Validators.required], //participant id
    assistant: [this.assignment.assistant], //participant id
    footerNote: this.assignment.footerNote, //Note id
  });

  //Subscriptions
  subscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private assignmentService: AssignmentService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private noteService: NoteService,
    private sharedService: SharedService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

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
    this.preparePrincipalSub();

    this.getPrincipalAndAssistant();

    //Set count for principals
    setCount(
      this.assignments,
      this.principals,
      this.gfv("room"),
      this.gfv("assignType"),
      true
    );

    //Set count for assistants
    setCount(
      this.assignments,
      this.assistants,
      this.gfv("room"),
      this.gfv("assignType"),
      false
    );

    this.principals.sort(sortParticipantsByCount);
    this.assistants.sort(sortParticipantsByCount);

    this.highlightIfAlreadyHasWork();

    this.principalsBK = structuredClone(this.principals);
    this.assistantsBK = structuredClone(this.assistants);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

        if (this.gfv("room")) {
          this.removeAssignTypesThatAlreadyExistOnAssignment();
        }
        if (this.gfv("room") && this.gfv("assignType")) {
          this.getPrincipalAndAssistant();

          //Set count for principals
          setCount(
            this.assignments,
            this.principals,
            this.gfv("room"),
            this.gfv("assignType"),
            true
          );

          //Set count for assistants
          setCount(
            this.assignments,
            this.assistants,
            this.gfv("room"),
            this.gfv("assignType"),
            false
          );

          this.principals.sort(sortParticipantsByCount);
          this.assistants.sort(sortParticipantsByCount);

          this.highlightIfAlreadyHasWork();

          this.principalsBK = structuredClone(this.principals);
          this.assistantsBK = structuredClone(this.assistants);
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

        if (this.gfv("date")) {
          this.removeAssignTypesThatAlreadyExistOnAssignment();
        }
        if (this.gfv("date") && this.gfv("assignType")) {
          this.getPrincipalAndAssistant();

          //Set count for principals
          setCount(
            this.assignments,
            this.principals,
            room,
            this.gfv("assignType"),
            true
          );

          //Set count for assistants
          setCount(
            this.assignments,
            this.assistants,
            room,
            this.gfv("assignType"),
            false
          );

          this.principals.sort(sortParticipantsByCount);
          this.assistants.sort(sortParticipantsByCount);

          this.highlightIfAlreadyHasWork();

          this.principalsBK = structuredClone(this.principals);
          this.assistantsBK = structuredClone(this.assistants);
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
            setCount(
              this.assignments,
              this.principals,
              this.gfv("room"),
              assignType,
              true
            );

            //Set count for assistants
            setCount(
              this.assignments,
              this.assistants,
              this.gfv("room"),
              assignType,
              false
            );

            this.principals.sort(sortParticipantsByCount);
            this.assistants.sort(sortParticipantsByCount);

            this.highlightIfAlreadyHasWork();

            this.principalsBK = structuredClone(this.principals);
            this.assistantsBK = structuredClone(this.assistants);
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
          this.principals = structuredClone(this.principalsBK);
          this.assistants = structuredClone(this.assistantsBK);
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
            this.principals = structuredClone(this.principalsBK);
            this.assistants = structuredClone(this.assistantsBK);
            return;
          }
          this.principals = this.principals.filter((p) => p.isWoman === true);
          this.assistants = this.assistants.filter((a) => a.isWoman === true);
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
      this.participantService.getParticipants(true),
      new Date(this.gfv("date")).getTime(),
      this.gfv("assignType"),
      this.gfv("room"),
      this.gfv("onlyMan"),
      this.gfv("onlyWoman")
    );

    this.assistants = this.sharedService.filterAssistantsByAvailable(
      this.participantService.getParticipants(true),
      new Date(this.gfv("date")).getTime(),
      this.gfv("assignType"),
      this.gfv("room"),
      this.gfv("onlyMan"),
      this.gfv("onlyWoman")
    );
  }

  /**
   * Highlight the participant if already has work
   */
  highlightIfAlreadyHasWork() {
    const dateValue = this.assignmentForm.get("date").value;

    this.principals.forEach(
      (p) =>
        (p.hasWork = this.assignments
          .filter(
            (a) => new Date(a.date).getTime() === new Date(dateValue).getTime()
          )
          .some((a) => a.principal === p.id || a.assistant === p.id))
    );

    this.assistants.forEach((as) => {
      as.hasWork = this.principals.some((p) => p.id === as.id && p.hasWork);
    });
  }

  /**
   * Remove assignTypes from select that already have assignment in the selected room
   * this piece of code is separated due to in create assignment must be rerun after submitAndCreate
   * depends on: assignments, selected room, selected date
   */
  removeAssignTypesThatAlreadyExistOnAssignment() {
    this.assignTypes = this.assignTypeService
      .getAssignTypes()
      .sort((a, b) => (a.order > b.order ? 1 : -1));

    this.assignTypes = this.assignTypes.filter(
      (at) =>
        !this.assignments.some(
          (a) =>
            new Date(a.date).getTime() ===
              new Date(this.assignmentForm.get("date").value).getTime() &&
            a.assignType === at.id &&
            a.room === this.assignmentForm.get("room").value
        )
    );
    //Reset if assignType selected not in new assignTypes
    if (
      !this.assignTypes.some(
        (at) => at.id === this.assignmentForm.get("assignType").value
      )
    )
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
    this.assignmentService.updateAssignment(this.assignmentForm.value);

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
}
