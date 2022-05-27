import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { DateAdapter } from "@angular/material/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslocoService } from "@ngneat/transloco";
import { Subscription } from "rxjs";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ParticipantInterface } from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { SharedService } from "app/services/shared.service";
import { RoomInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { LastDateService } from "app/assignment/service/last-date.service";
import { setCount } from "app/functions/setCount";
import { sortParticipantsByCount } from "app/functions/sortParticipantsByCount";
import { setListToOnlyMen } from "app/functions/setListToOnlyMen";
import { setListToOnlyWomen } from "app/functions/setListToOnlyWomen";

@Component({
  selector: "app-create-assignment",
  templateUrl: "./create-assignment.component.html",
  styleUrls: ["./create-assignment.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAssignmentComponent implements OnInit, OnDestroy {
  rooms: RoomInterface[] = this.roomService.getRooms();
  assignTypes: AssignTypeInterface[] = this.assignTypeService.getAssignTypes();
  footerNotes: NoteInterface[] = this.noteService.getNotes();
  assignments: AssignmentInterface[] = this.assignmentService.getAssignments();

  principalList: ParticipantInterface[];
  assistantList: ParticipantInterface[];

  principalsBackup: ParticipantInterface[];

  hasAssignmentsList: string[] = [];
  hasAssignmentsAssistantList: string[] = [];

  lastDate: Date = this.lastDateService.getLastDate();

  //Subscriptions
  dateSub$: Subscription;
  principalSub$: Subscription;
  assistantSub$: Subscription;
  roomSub$: Subscription;
  assignTypeSub$: Subscription;
  onlyManSub$: Subscription;
  onlyWomanSub$: Subscription;
  langSub$: Subscription;

  assignmentForm = this.formBuilder.group({
    id: undefined,
    date: [undefined, Validators.required],
    room: [{ value: undefined, disabled: true }, Validators.required], //Room id
    assignType: [{ value: undefined, disabled: true }, Validators.required], //AssignType id
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
    private sharedService: SharedService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translocoService: TranslocoService,
    private dateAdapter: DateAdapter<Date>,
    private lastDateService: LastDateService
  ) {}

  ngOnInit() {
    this.langSubscription();
    this.dateSubscription();
    this.onlyWomanSubscription();
    this.onlyManSubscription();
    this.roomSubscription();
    this.assignTypeSubscription();
    this.principalSubscription();
    this.assistantSubscription();
  }

  /**
   * Unsubscribe from subscriptions
   */
  ngOnDestroy(): void {
    this.dateSub$.unsubscribe();
    this.principalSub$.unsubscribe();
    this.assistantSub$.unsubscribe();
    this.onlyManSub$.unsubscribe();
    this.onlyWomanSub$.unsubscribe();
    this.roomSub$.unsubscribe();
    this.assignTypeSub$.unsubscribe();
    this.langSub$.unsubscribe();
  }

  onSubmit(): void {
    this.assignmentService.createAssignment(this.assignmentForm.value);

    //navigate to parent
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }

  submitAndCreate(): void {
    this.assignmentService.createAssignment(this.assignmentForm.value);

    const date = this.assignmentForm.get("date").value;
    this.assignmentForm.reset();
    this.assignmentForm.get("date").setValue(date);
  }

  /**
   *
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
   * Prepare the date subscription
   */
  dateSubscription() {
    const dateControl = this.getDateControl();
    this.dateSub$ = dateControl.valueChanges.subscribe((date) => {
      //Save last date
      this.lastDateService.setLastDate(date);

      const roomControl = this.getRoomControl();
      const assignTypeControl = this.getAssignTypeControl();

      roomControl.enable({ emitEvent: false });
      assignTypeControl.enable({ emitEvent: false });
    });
  }
  /**
   * Prepare the only woman subscription
   */
  onlyWomanSubscription() {
    this.onlyWomanSub$ = this.getOnlyWomanControl().valueChanges.subscribe(
      (isChecked) => {
        const onlyManControl = this.getOnlyManControl();

        if (!isChecked) {
          this.principalList = this.participantService.getParticipants(true);
          onlyManControl.enable({ emitEvent: false });
          this.assignmentForm.get("principal").reset(undefined);
          return;
        }

        this.principalList = setListToOnlyWomen(
          this.participantService.getParticipants(true)
        );
        onlyManControl.disable({ emitEvent: false });
        this.assignmentForm.get("principal").reset(undefined);
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

        if (!isChecked) {
          this.principalList = this.participantService.getParticipants(true);
          onlyWomanControl.enable({ emitEvent: false });
          this.assignmentForm.get("principal").reset(undefined);
          return;
        }
        this.principalList = setListToOnlyMen(
          this.participantService.getParticipants(true)
        );
        onlyWomanControl.disable({ emitEvent: false });

        this.assignmentForm.get("principal").reset(undefined);
      }
    );
  }

  /**
   * Prepare the assignType subscription
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

          this.principalList = this.participantService.getParticipants();

          this.principalList = this.sharedService.filterPrincipalsByAvailable(
            this.principalList,
            assignTypeValue,
            roomControl.value
          );

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
          if (principalControl.disabled) {
            principalControl.enable({ emitEvent: false });
            return;
          }
          principalControl.setValue(principalControl.value);
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

          this.principalList = this.participantService.getParticipants();

          this.principalList = this.sharedService.filterPrincipalsByAvailable(
            this.principalList,
            assignTypeControl.value,
            roomValue
          );

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
          if (principalControl.disabled) {
            principalControl.enable({ emitEvent: false });
            return;
          }
          principalControl.setValue(principalControl.value);
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

        if (!principalId) {
          assistantControl.reset(undefined, { emitEvent: false });
          assistantControl.disable({ emitEvent: false });
          return;
        }
        const onlyWomanControl = this.getOnlyWomanControl();
        const onlyManControl = this.getOnlyManControl();
        const roomControl = this.getRoomControl();
        const assignTypeControl = this.getAssignTypeControl();

        this.assistantList = this.participantService.getParticipants();

        //Remove principal from the list of assistants
        this.assistantList = this.assistantList.filter(
          (b) => b.id !== principalId
        );

        this.assistantList = this.sharedService.filterAssistantsByAvailable(
          this.assistantList,
          assignTypeControl.value,
          roomControl.value
        );

        //the current count is of the principal, we need to calculate again for the assistant
        setCount(
          this.assignments,
          this.assistantList,
          roomControl.value,
          assignTypeControl.value,
          false
        );

        /* onlyWoman and onlyMan are enabled after room and assignType so its not possible to have values.
          This scenario is when onlyWoman or onlyMan is checked and the user wants to change the current room. */
        if (onlyWomanControl.value) {
          this.assistantList = setListToOnlyWomen(this.assistantList);
        }
        if (onlyManControl.value) {
          this.assistantList = setListToOnlyMen(this.assistantList);
        }

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
}
