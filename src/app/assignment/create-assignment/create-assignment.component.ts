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
import { filter, pairwise, startWith, Subscription } from "rxjs";

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
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));
  principals: ParticipantInterface[] = [];
  assistants: ParticipantInterface[] = [];
  footerNotes: NoteInterface[] = this.noteService.getNotes();
  assignments: AssignmentInterface[] =
    this.assignmentService.getAssignments(true);

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
  formSub$: Subscription;
  lastDateSub$: Subscription;

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

  ngOnInit() {
    this.lastDateSub$ = this.assignmentForm
      .get("date")
      .valueChanges.subscribe((date) => {
        this.lastDateService.lastDate = date;
      });

    /*
      Only when assignType, room, onlyMan or onlyWoman changes principal and assistant must change
      if theme is getting filled, we dont want a subscribe for each letter so -> "filter"
      pairwise is used to get the prev and last value, and the initial prev value is the form value
    */
    this.formSub$ = this.assignmentForm.valueChanges
      .pipe(
        startWith(this.assignmentForm.value),
        pairwise(),
        filter(
          ([prev, next]: [AssignmentInterface, AssignmentInterface]) =>
            prev.theme === next.theme
        )
      )
      .subscribe(([prev, next]: [AssignmentInterface, AssignmentInterface]) => {
        this.getData();

        if (
          next.assignType !== prev.assignType ||
          next.room !== prev.room ||
          next.onlyMan !== prev.onlyMan ||
          next.onlyWoman !== prev.onlyWoman
        ) {
          this.assignmentForm
            .get("principal")
            .reset(undefined, { emitEvent: false });

          this.assignmentForm
            .get("assistant")
            .reset(undefined, { emitEvent: false });
        }
      });
  }

  ngOnDestroy(): void {
    this.formSub$.unsubscribe();
    this.lastDateSub$.unsubscribe();
  }

  /**
   * Remove assignTypes from select that already have assignment in the selected room
   * this piece of code is separated due to in create assignment must be rerun after submitAndCreate
   * depends on: assignments, selected room, selected date
   */
  removeAssignTypesThatAlreadyExistOnAssignment() {
    this.assignments = this.assignmentService.getAssignments();
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

  getData() {
    const initGetData = performance.now();
    this.removeAssignTypesThatAlreadyExistOnAssignment();

    this.principals = this.sharedService.filterPrincipalsByAvailable(
      this.participantService.getParticipants(true),
      this.assignmentForm.get("assignType").value,
      this.assignmentForm.get("room").value
    );

    //remove not available dates from principals
    const formSelectedDate = new Date(
      this.assignmentForm.get("date").value
    ).getTime();
    this.principals = this.principals.filter(
      (p) =>
        !p.notAvailableDates.some(
          (date) => formSelectedDate === new Date(date).getTime()
        )
    );

    this.assistants = this.sharedService.filterAssistantsByAvailable(
      this.participantService.getParticipants(true),
      this.assignmentForm.get("assignType").value,
      this.assignmentForm.get("room").value
    );

    //remove not available dates from assistants
    this.assistants = this.assistants.filter(
      (p) =>
        !p.notAvailableDates.some(
          (date) => formSelectedDate === new Date(date).getTime()
        )
    );

    if (this.assignmentForm.get("onlyMan").value) {
      this.principals = this.principals.filter((p) => p.isWoman === false);
      this.assistants = this.assistants.filter((a) => a.isWoman === false);
    }

    if (this.assignmentForm.get("onlyWoman").value) {
      this.principals = this.principals.filter((p) => p.isWoman === true);
      this.assistants = this.assistants.filter((a) => a.isWoman === true);
    }

    //Set count for principals
    setCount(
      this.assignments,
      this.principals,
      this.assignmentForm.get("room").value,
      this.assignmentForm.get("assignType").value,
      true
    );

    //Set count for assistants
    setCount(
      this.assignments,
      this.assistants,
      this.assignmentForm.get("room").value,
      this.assignmentForm.get("assignType").value,
      false
    );

    this.principals.sort(sortParticipantsByCount);
    this.assistants.sort(sortParticipantsByCount);

    //colors if already has work
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
    console.log(performance.now() - initGetData);
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

    this.assignmentForm.reset({ emitEvent: false });

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
