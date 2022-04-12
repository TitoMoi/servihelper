import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { DateAdapter } from "@angular/material/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslocoService } from "@ngneat/transloco";
import { Subscription } from "rxjs";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ParticipantInterface } from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { RoomInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { LastDateService } from "app/assignment/service/last-date.service";
import { setCount } from "app/functions/setCount";
import { sortParticipantsByCount } from "app/functions/sortParticipantsByCount";
import { setListToOnlyMen } from "app/functions/setListToOnlyMen";
import { setListToOnlyWomen } from "app/functions/setListToOnlyWomen";
import { checkIsPrincipalAvailable } from "app/functions/checkIsPrincipalAvailable";
import { checkIsAssistantAvailable } from "app/functions/checkIsAssistantAvailable";

@Component({
  selector: "app-create-assignment",
  templateUrl: "./create-assignment.component.html",
  styleUrls: ["./create-assignment.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAssignmentComponent implements OnInit, OnDestroy {
  rooms: RoomInterface[];
  assignTypes: AssignTypeInterface[];
  principalList: ParticipantInterface[];
  assistantList: ParticipantInterface[];
  footerNotes: NoteInterface[];
  assignments: AssignmentInterface[];
  hasAssignmentsList: string[];
  hasAssignmentsAssistantList: string[];

  principalsBackup: ParticipantInterface[];

  lastDate: Date;

  //Subscriptions
  dateSub$: Subscription;
  principalSub$: Subscription;
  assistantSub$: Subscription;
  roomSub$: Subscription;
  assignTypeSub$: Subscription;
  onlyManSub$: Subscription;
  onlyWomanSub$: Subscription;
  langSub$: Subscription;

  assignmentForm;

  constructor(
    private formBuilder: FormBuilder,
    private assignmentService: AssignmentService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private participantService: ParticipantService,
    private noteService: NoteService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translocoService: TranslocoService,
    private dateAdapter: DateAdapter<Date>,
    private lastDateService: LastDateService
  ) {
    this.assignmentForm = this.formBuilder.group({
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
    this.hasAssignmentsList = [];
    this.hasAssignmentsAssistantList = [];

    //Check if we have lastSelectedDate
    this.lastDate = this.lastDateService.getLastDate();
  }

  async ngOnInit() {
    this.langSubscription();
    const data = await this.getInitialData();
    this.setInitialData(data);
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

  /**
   * Gets the initial data for rooms, assignTypes, footerNotes, assignments
   */
  async getInitialData() {
    const data = await Promise.all([
      this.getRooms(),
      this.getAssignTypes(),
      this.getFooterNotes(),
      this.getAssignments(),
    ]);
    return data;
  }

  /**
   * Sets the initial data
   * @param data the array of data, the order is based on the Promise.all
   */
  setInitialData(data) {
    this.rooms = data[0];
    this.assignTypes = data[1];
    this.footerNotes = data[2];
    this.assignments = data[3];
  }

  getRooms(): Promise<RoomInterface[]> {
    return this.roomService.getRooms();
  }

  getAssignTypes(): Promise<AssignTypeInterface[]> {
    return this.assignTypeService.getAssignTypes();
  }

  getFooterNotes(): Promise<NoteInterface[]> {
    return this.noteService.getNotes();
  }

  //Get assignments
  getAssignments(): Promise<AssignmentInterface[]> {
    return this.assignmentService.getAssignments();
  }

  async onSubmit(assignment: AssignmentInterface): Promise<void> {
    await this.assignmentService.createAssignment(assignment);

    //navigate to parent
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
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
   */
  assignTypeSubscription() {
    this.assignTypeSub$ = this.getAssignTypeControl().valueChanges.subscribe(
      async (assignTypeValue) => {
        const roomControl = this.getRoomControl();
        const principalControl = this.getPrincipalControl();

        if (assignTypeValue && roomControl.value) {
          const onlyWomanControl = this.getOnlyWomanControl();
          const onlyManControl = this.getOnlyManControl();

          this.tryToEnableGenderControls();

          this.principalList = await this.participantService.getParticipants();

          for (const participant of this.principalList) {
            let isAvailable = checkIsPrincipalAvailable(
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
        }
      }
    );
  }

  /**
   * Prepare the room subscription
   */
  roomSubscription() {
    this.roomSub$ = this.getRoomControl().valueChanges.subscribe(
      async (roomValue) => {
        const assignTypeControl = this.getAssignTypeControl();
        const principalControl = this.getPrincipalControl();

        if (roomValue && assignTypeControl.value) {
          const onlyWomanControl = this.getOnlyWomanControl();
          const onlyManControl = this.getOnlyManControl();

          this.tryToEnableGenderControls();

          this.principalList = await this.participantService.getParticipants();

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
      async (principalId) => {
        const assistantControl = this.getAssistantControl();

        if (principalId) {
          const onlyWomanControl = this.getOnlyWomanControl();
          const onlyManControl = this.getOnlyManControl();
          const roomControl = this.getRoomControl();
          const assignTypeControl = this.getAssignTypeControl();

          this.assistantList = await this.participantService.getParticipants();

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
   *
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
  getDateControl(): FormControl {
    return this.assignmentForm.get("date");
  }

  /**
   * @returns the onlyWoman form control
   */
  getOnlyWomanControl(): FormControl {
    return this.assignmentForm.get("onlyWoman");
  }

  /**
   * @returns the onlyMan form control
   */
  getOnlyManControl(): FormControl {
    return this.assignmentForm.get("onlyMan");
  }

  /**
   * @returns the assignType form control
   */
  getAssignTypeControl(): FormControl {
    return this.assignmentForm.get("assignType");
  }

  /**
   * @returns the room form control
   */
  getRoomControl(): FormControl {
    return this.assignmentForm.get("room");
  }

  /**
   * @returns the principal form control
   */
  getPrincipalControl(): FormControl {
    return this.assignmentForm.get("principal");
  }

  /**
   * @returns the assistant form control
   */
  getAssistantControl(): FormControl {
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
    this.principalList = this.principalsBackup.map((participant) => ({
      ...participant,
    }));
  }
}
