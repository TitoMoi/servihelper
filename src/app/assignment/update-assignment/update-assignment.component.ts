import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
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
import { first, Subject, Subscription } from "rxjs";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";

import { setCount } from "app/functions/setCount";
import { setListToOnlyMen } from "app/functions/setListToOnlyMen";
import { setListToOnlyWomen } from "app/functions/setListToOnlyWomen";
import { checkIsPrincipalAvailable } from "app/functions/checkIsPrincipalAvailable";
import { checkIsAssistantAvailable } from "app/functions/checkIsAssistantAvailable";
import { sortParticipantsByCount } from "app/functions/sortParticipantsByCount";

@Component({
  selector: "app-update-assignment",
  templateUrl: "./update-assignment.component.html",
  styleUrls: ["./update-assignment.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateAssignmentComponent implements OnInit, OnDestroy {
  rooms: RoomInterface[] = this.roomService.getRooms();
  assignTypes: AssignTypeInterface[] = this.assignTypeService.getAssignTypes();
  principalList: ParticipantInterface[] =
    this.participantService.getParticipants();
  assistantList: ParticipantInterface[] = [];
  footerNotes: NoteInterface[] = this.noteService.getNotes();
  assignments: AssignmentInterface[] = this.assignmentService.getAssignments();
  hasAssignmentsList: string[] = [];
  hasAssignmentsAssistantList: string[] = [];

  principalsBackup: ParticipantInterface[] = [];

  isCalculated = false;

  //Subscriptions
  principalSub$: Subscription;
  assistantSub$: Subscription;
  roomSub$: Subscription;
  assignTypeSub$: Subscription;
  onlyManSub$: Subscription;
  onlyWomanSub$: Subscription;
  langSub$: Subscription;

  canContinueSub$: Subject<boolean> = new Subject<boolean>();

  assignmentForm: FormGroup = this.formBuilder.group({
    id: undefined,
    date: [undefined, Validators.required],
    room: [undefined, Validators.required], //Room id
    assignType: [undefined, Validators.required], //AssignType id
    theme: undefined,
    onlyWoman: [{ value: undefined, disabled: true }],
    onlyMan: [{ value: undefined, disabled: true }],
    principal: [{ value: undefined, disabled: true }, Validators.required], //participant id
    assistant: [{ value: undefined, disabled: true }], //participant id
    footerNote: undefined, //Note id
  });

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
    this.langSubscription();
    this.onlyWomanSubscription();
    this.onlyManSubscription();
    this.roomSubscription();
    this.assignTypeSubscription();
    this.principalSubscription();
    this.assistantSubscription();

    this.activatedRoute.params.subscribe((params) => {
      //Fill the form with the assignment passed by the router
      this.setAssignmentData(params.id);

      //activate template
      this.isCalculated = true;
      //this is for isCalculated
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.principalSub$.unsubscribe();
    this.assistantSub$.unsubscribe();
    this.onlyManSub$.unsubscribe();
    this.onlyWomanSub$.unsubscribe();
    this.roomSub$.unsubscribe();
    this.assignTypeSub$.unsubscribe();
    this.langSub$.unsubscribe();
  }

  /**
   *
   * @param id the id of the assignment to search
   */
  setAssignmentData(id: string) {
    const assignment = this.assignmentService.getAssignment(id);
    this.assignmentForm.get("id").setValue(assignment.id, { emitEvent: false });
    this.assignmentForm
      .get("date")
      .setValue(assignment.date, { emitEvent: false });
    this.getRoomControl().setValue(assignment.room, { emitEvent: false });
    this.getAssignTypeControl().setValue(assignment.assignType); //Emit

    //Wait for assignType subscription executes, only first time
    this.canContinueSub$.pipe(first()).subscribe((canContinue) => {
      this.assignmentForm
        .get("theme")
        .setValue(assignment.theme, { emitEvent: false });

      if (assignment.onlyWoman) {
        this.getOnlyWomanControl().setValue(assignment.onlyWoman); //Emit;
      }

      if (assignment.onlyMan) {
        this.getOnlyManControl().setValue(assignment.onlyMan); //Emit
      }

      this.getPrincipalControl().setValue(assignment.principal); //Emit
      this.getAssistantControl().setValue(assignment.assistant); //Emit
      this.assignmentForm
        .get("footerNote")
        .setValue(assignment.footerNote, { emitEvent: false });
    });
  }

  onSubmit(assignment: AssignmentInterface): void {
    this.assignmentService.updateAssignment(assignment);

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
   * Prepare the only woman subscription
   */
  onlyWomanSubscription() {
    this.onlyWomanSub$ = this.getOnlyWomanControl().valueChanges.subscribe(
      (isChecked) => {
        const onlyManControl = this.getOnlyManControl();

        if (isChecked) {
          this.setPrincipalsBackupState();
          onlyManControl.disable({ emitEvent: false });
          this.principalList = setListToOnlyWomen(this.principalList);
        } else {
          onlyManControl.enable({ emitEvent: false });
          this.getPrincipalsBackupState();
        }
        this.resetPrincipal();
      }
    );
  }

  /**
   * Prepare the only man subscription
   */
  onlyManSubscription() {
    this.onlyManSub$ = this.getOnlyManControl().valueChanges.subscribe(
      (isChecked) => {
        const onlyWomanControl = this.getOnlyWomanControl();

        if (isChecked) {
          this.setPrincipalsBackupState();
          onlyWomanControl.disable({ emitEvent: false });
          this.principalList = setListToOnlyMen(this.principalList);
        } else {
          onlyWomanControl.enable({ emitEvent: false });
          this.getPrincipalsBackupState();
        }
        this.resetPrincipal();
      }
    );
  }

  /**
   * Prepare the assignType subscription
   * @returns Observable<boolean> that emits when ends the observer
   */
  assignTypeSubscription() {
    this.assignTypeSub$ = this.getAssignTypeControl().valueChanges.subscribe(
      (assignTypeValue) => {
        const roomControl = this.getRoomControl();
        const principalControl = this.getPrincipalControl();

        if (assignTypeValue && roomControl.value) {
          const onlyWomanControl = this.getOnlyWomanControl();
          const onlyManControl = this.getOnlyManControl();

          this.tryToEnableGenderControls();

          //Mandatory to get them every time
          this.principalList = this.participantService.getParticipants();

          for (const participant of this.principalList) {
            const isAvailable = checkIsPrincipalAvailable(
              participant,
              assignTypeValue,
              roomControl.value
            );

            this.filterPrincipalsByAvailable(participant, isAvailable);
          }

          setCount(
            this.assignments,
            this.principalList,
            roomControl.value,
            assignTypeValue,
            true
          );

          /* onlyWoman and onlyMan are enabled after room and assignType so its not possible to have values.
          This scenario is when onlyWoman or onlyMan is checked and the user wants to change the current room. */
          if (onlyWomanControl.value) {
            this.principalList = setListToOnlyWomen(this.principalList);
          }
          if (onlyManControl.value) {
            this.principalList = setListToOnlyMen(this.principalList);
          }
          this.principalList.sort(sortParticipantsByCount);

          /* This means we have principal selected and updating assignType
          so we force the principal subscription to affect the assistants */
          if (!principalControl.disabled) {
            principalControl.setValue(principalControl.value);
          } else {
            principalControl.enable({ emitEvent: false });
          }
          this.canContinueSub$.next(true);
        }
      }
    );
  }

  /**
   * Prepare the room subscription
   */
  roomSubscription() {
    this.roomSub$ = this.getRoomControl().valueChanges.subscribe(
      (roomValue) => {
        const assignTypeControl = this.getAssignTypeControl();
        const principalControl = this.getPrincipalControl();

        if (roomValue && assignTypeControl.value) {
          const onlyWomanControl = this.getOnlyWomanControl();
          const onlyManControl = this.getOnlyManControl();

          this.tryToEnableGenderControls();

          //Mandatory to get them every time
          this.principalList = this.participantService.getParticipants();

          for (const participant of this.principalList) {
            const isAvailable = checkIsPrincipalAvailable(
              participant,
              assignTypeControl.value,
              roomValue
            );

            this.filterPrincipalsByAvailable(participant, isAvailable);
          }

          setCount(
            this.assignments,
            this.principalList,
            roomValue,
            assignTypeControl.value,
            true
          );

          /* onlyWoman and onlyMan are enabled after room and assignType so its not possible to have values.
          This scenario is when onlyWoman or onlyMan is checked and the user wants to change the current room. */
          if (onlyWomanControl.value) {
            this.principalList = setListToOnlyWomen(this.principalList);
          }
          if (onlyManControl.value) {
            this.principalList = setListToOnlyMen(this.principalList);
          }

          this.principalList.sort(sortParticipantsByCount);

          /* This means we have principal selected and updating room
          so we force the principal subscription to affect the assistants */
          if (!principalControl.disabled) {
            principalControl.setValue(principalControl.value);
          } else {
            principalControl.enable({ emitEvent: false });
          }
        }
      }
    );
  }

  /**
   * Prepare the principal subscription
   */
  principalSubscription() {
    this.principalSub$ = this.getPrincipalControl().valueChanges.subscribe(
      (principalId) => {
        const assistantControl = this.getAssistantControl();

        if (principalId) {
          const roomControl = this.getRoomControl();
          const assignTypeControl = this.getAssignTypeControl();

          this.assistantList = this.participantService.getParticipants();

          //Remove principal from the list of assistants
          this.assistantList = this.assistantList.filter(
            (b) => b.id !== principalId
          );

          for (const participant of this.assistantList) {
            const isAvailable = checkIsAssistantAvailable(
              participant,
              assignTypeControl.value,
              roomControl.value
            );

            this.filterAssistantsByAvailable(participant, isAvailable);
          }

          //the current count is of the principal, we need to calculate again for the assistant
          setCount(
            this.assignments,
            this.assistantList,
            roomControl.value,
            assignTypeControl.value,
            false
          );

          this.assistantList.sort(sortParticipantsByCount);

          assistantControl.enable({ emitEvent: false });

          //Check if participant has more assignments for the date
          this.hasAssignmentsList = [];

          let assignments =
            this.assignmentService.findPrincipalAssignmentsByParticipantId(
              principalId
            );
          //Filter the date
          const dateControl = this.getDateControl();
          assignments = assignments.filter(
            (assignment) =>
              new Date(dateControl.value).getDate() ===
              new Date(assignment.date).getDate()
          );
          //Get name
          for (const assignment of assignments) {
            const assignTypeName = this.assignTypeService.getAssignTypeNameById(
              assignment.assignType
            );
            this.hasAssignmentsList.push(assignTypeName);
          }
        } else {
          assistantControl.reset(undefined, { emitEvent: false });
          assistantControl.disable({ emitEvent: false });
        }
      }
    );
  }

  /**
   * prepare the assitant change subscription
   *
   */
  assistantSubscription() {
    this.assistantSub$ = this.getAssistantControl().valueChanges.subscribe(
      (assistantId) => {
        //Check if assistant has more assignments for the date
        this.hasAssignmentsAssistantList = [];

        let assignments =
          this.assignmentService.findAssistantAssignmentsByParticipantId(
            assistantId
          );
        //Filter the date
        const dateControl = this.getDateControl();
        assignments = assignments.filter(
          (assignment) =>
            new Date(dateControl.value).getDate() ===
            new Date(assignment.date).getDate()
        );
        //Get name
        for (const assignment of assignments) {
          const assignTypeName = this.assignTypeService.getAssignTypeNameById(
            assignment.assignType
          );
          this.hasAssignmentsAssistantList.push(assignTypeName);
        }
      }
    );
  }
  /**
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
   *
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

  /**
   * If a gender control is active respect the current values, else activate the controls
   */
  tryToEnableGenderControls() {
    const onlyWomanControl = this.getOnlyWomanControl();
    const onlyManControl = this.getOnlyManControl();
    if (!onlyWomanControl.value && !onlyManControl.value) {
      onlyWomanControl.enable({ emitEvent: false });
      onlyManControl.enable({ emitEvent: false });
    }
  }

  /**
   * @returns the date form control
   */
  getDateControl() {
    return this.assignmentForm.get("date");
  }

  /**
   * @returns the onlyWoman form control
   */
  getOnlyWomanControl() {
    return this.assignmentForm.get("onlyWoman");
  }

  /**
   * @returns the onlyMan form control
   */
  getOnlyManControl() {
    return this.assignmentForm.get("onlyMan");
  }

  /**
   * @returns the assignType form control
   */
  getAssignTypeControl() {
    return this.assignmentForm.get("assignType");
  }

  /**
   * @returns the room form control
   */
  getRoomControl() {
    return this.assignmentForm.get("room");
  }

  /**
   * @returns the principal form control
   */
  getPrincipalControl() {
    return this.assignmentForm.get("principal");
  }

  /**
   * @returns the assistant form control
   */
  getAssistantControl() {
    return this.assignmentForm.get("assistant");
  }

  /**
   * resets the value of the principal control
   */
  resetPrincipal() {
    const principalControl = this.assignmentForm.get("principal");
    principalControl.reset(undefined);
  }

  /**
   * Creates a backup copy of the participants
   */
  setPrincipalsBackupState() {
    this.principalsBackup = this.principalList.map((participant) => ({
      ...participant,
    }));
  }

  /**
   *
   * Creates a new principalList from the backup
   */
  getPrincipalsBackupState() {
    if (this.principalsBackup.length) {
      this.principalList = this.principalsBackup.map((participant) => ({
        ...participant,
      }));
    }
  }
}
