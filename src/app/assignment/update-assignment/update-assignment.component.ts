import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DateAdapter } from "@angular/material/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslocoService } from "@ngneat/transloco";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ParticipantInterface } from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { RoomInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";
import { Subscription } from "rxjs";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";

import { setCount } from "app/functions/setCount";
import { setListToOnlyMen } from "app/functions/setListToOnlyMen";
import { setListToOnlyWomen } from "app/functions/setListToOnlyWomen";
import { sortParticipantsByCount } from "app/functions/sortParticipantsByCount";

@Component({
  selector: "app-update-assignment",
  templateUrl: "./update-assignment.component.html",
  styleUrls: ["./update-assignment.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateAssignmentComponent implements OnInit, OnDestroy {
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

  rooms: RoomInterface[] = this.roomService.getRooms();
  assignTypes: AssignTypeInterface[] = this.assignTypeService.getAssignTypes();
  principalList: ParticipantInterface[] =
    this.participantService.getParticipants();
  assistantList: ParticipantInterface[] = [];
  footerNotes: NoteInterface[] = this.noteService.getNotes();
  assignments: AssignmentInterface[] = this.assignmentService.getAssignments();
  hasAssignmentsList: string[] = [];
  hasAssignmentsAssistantList: string[] = [];

  //Subscriptions
  principalSub$: Subscription;
  assistantSub$: Subscription;
  roomSub$: Subscription;
  assignTypeSub$: Subscription;
  onlyManSub$: Subscription;
  onlyWomanSub$: Subscription;
  langSub$: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private assignmentService: AssignmentService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private noteService: NoteService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dateAdapter: DateAdapter<any>,
    private translocoService: TranslocoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    //Prepare the subscriptions for changes
    /* 
    this.onlyWomanSubscription();
    this.onlyManSubscription();
    this.roomSubscription();
    this.assignTypeSubscription();
    this.principalSubscription();
    this.assistantSubscription();
 */
    this.langSubscription();
    this.assignmentForm.valueChanges.subscribe(
      (assignment: AssignmentInterface) => {
        console.log(assignment);
      }
    );
  }

  ngOnDestroy(): void {
    /*  this.principalSub$.unsubscribe();
    this.assistantSub$.unsubscribe();
    this.onlyManSub$.unsubscribe();
    this.onlyWomanSub$.unsubscribe();
    this.roomSub$.unsubscribe();
    this.assignTypeSub$.unsubscribe();
    this.langSub$.unsubscribe(); */
  }

  onSubmit(): void {
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

  /**
   * Prepare the lang subscription
   */
  langSubscription() {
    //Set datepicker lang to locale
    this.langSub$ = this.translocoService.langChanges$.subscribe((lang) => {
      this.dateAdapter.setLocale(lang);
    });
  }

  /**
   * YA EXISTE UNA FUNCION PARA ESTO?
   * @param participant the principal participant of the bucle
   * @param isAvailable the resolved boolean
   */
  filterPrincipalsByAvailable(
    participant: ParticipantInterface,
    isAvailable: boolean
  ) {
    if (!isAvailable) {
      this.principalList = this.principalList.filter(
        (b) => b.id !== participant.id
      );
    }
  }

  /**
   *YA EXISTE UNA FUNCION PARA ESTO?
   * @param participant the assistant participant of the bucle
   * @param isAvailable the resolved boolean
   */
  filterAssistantsByAvailable(
    participant: ParticipantInterface,
    isAvailable: boolean
  ) {
    if (!isAvailable) {
      this.assistantList = this.assistantList.filter(
        (b) => b.id !== participant.id
      );
    }
  }
}
