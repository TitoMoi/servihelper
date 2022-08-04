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
import { ParticipantInterface } from "app/participant/model/participant.model";
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

  principals: ParticipantInterface[] = [];
  assistants: ParticipantInterface[] = [];
  footerNotes: NoteInterface[] = this.noteService.getNotes();
  assignments: AssignmentInterface[] = this.assignmentService.getAssignments();

  principalsBK: ParticipantInterface[] = [];
  assistantsBK: ParticipantInterface[] = [];

  assignmentForm: FormGroup = this.formBuilder.group({
    id: undefined,
    date: [undefined, Validators.required],
    room: [undefined, Validators.required], //Room id
    assignType: [undefined, Validators.required], //AssignType id
    theme: "",
    onlyWoman: [false],
    onlyMan: [false],
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
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  prepareDateSub() {
    this.subscription = this.assignmentForm
      .get("date")
      .valueChanges.subscribe((date) => {
        this.lastDateService.lastDate = date;

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
      this.participantService.getParticipants(),
      new Date(this.gfv("date")).getTime(),
      this.gfv("assignType"),
      this.gfv("room"),
      this.gfv("onlyMan"),
      this.gfv("onlyWoman")
    );

    this.assistants = this.sharedService.filterAssistantsByAvailable(
      this.participantService.getParticipants(),
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

    const date = this.assignmentForm.get("date").value;
    const footerNote = this.assignmentForm.get("footerNote").value;
    const room = this.assignmentForm.get("room").value;
    const onlyMan = this.assignmentForm.get("onlyMan").value;
    const onlyWoman = this.assignmentForm.get("onlyWoman").value;

    this.assignmentForm.reset(
      {
        id: undefined,
        date: [undefined, Validators.required],
        room: [undefined, Validators.required], //Room id
        assignType: [undefined, Validators.required], //AssignType id
        theme: "",
        onlyWoman: [false],
        onlyMan: [false],
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

    //Reset assign types select
    this.removeAssignTypesThatAlreadyExistOnAssignment();
  }

  onSelectionChangePrincipal() {
    this.principalSelect.close();
    //Wait until button is enabled otherwise not works
    setTimeout(() => this.btnSaveCreateAnother.focus(), 0);
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
}
