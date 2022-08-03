import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import {
  ParticipantAssignTypesInterface,
  ParticipantInterface,
  ParticipantRoomInterface,
} from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormArray, FormBuilder, Validators } from "@angular/forms";
import {
  MatDatepicker,
  MatDatepickerInputEvent,
} from "@angular/material/datepicker";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-update-participant",
  templateUrl: "./update-participant.component.html",
  styleUrls: ["./update-participant.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateParticipantComponent implements OnInit, OnDestroy {
  @ViewChild(MatDatepicker) datePickerRef: MatDatepicker<Date>;

  participant: ParticipantInterface;
  rooms: RoomInterface[] = this.roomService
    .getRooms()
    .sort((a, b) => (a.order > b.order ? 1 : -1));
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  closeOnSelected = false;
  init = new Date();
  resetModel = new Date(0);
  notAvailableDates = [];

  timeoutRef;

  participantForm = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
    isWoman: [false],
    available: [undefined],
    rooms: [this.formBuilder.array([])],
    assignTypes: [this.formBuilder.array([])],
  });

  constructor(
    private formBuilder: FormBuilder,
    private participantService: ParticipantService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  //Accesor for the template, not working fine on the ts -> use this.participantForm.get
  get getRoomsForm(): FormArray {
    return this.participantForm.controls.rooms as FormArray;
  }

  //Accesor for the template, not working fine on the ts -> use this.participantForm.get
  get getAssignTypesForm(): FormArray {
    return this.participantForm.controls.assignTypes as FormArray;
  }

  ngOnInit(): void {
    this.participant = this.participantService.getParticipant(
      this.activatedRoute.snapshot.params.id
    );

    this.participantForm.setValue({
      id: this.participant.id,
      name: this.participant.name,
      isWoman: this.participant.isWoman,
      available: this.participant.available,
      rooms: [this.formBuilder.array([])],
      assignTypes: [this.formBuilder.array([])],
    });

    this.setParticipantRooms();
    this.setParticipantAssignTypes();

    this.notAvailableDates = this.participant.notAvailableDates;
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeoutRef);
  }

  getRoomName(id) {
    if (this.rooms) {
      const room = this.rooms.filter((r) => r.id === id);
      return room[0].name;
    }
  }

  setParticipantRooms() {
    //Create control
    this.participantForm.setControl("rooms", this.formBuilder.array([]));
    //Populate control with rooms
    this.participant.rooms.forEach((r: ParticipantRoomInterface) => {
      const roomGroup = this.formBuilder.group({
        //ParticipantRoomInterface
        roomId: [r.roomId, Validators.required],
        available: [r.available, Validators.required],
      });
      //Add assignType to the form
      const fa = this.participantForm.get("rooms") as FormArray;
      fa.push(roomGroup);
    });
  }

  setParticipantAssignTypes() {
    //Create control
    this.participantForm.setControl("assignTypes", this.formBuilder.array([]));
    //Populate control with rooms
    this.participant.assignTypes.forEach(
      (at: ParticipantAssignTypesInterface) => {
        const assignType = this.formBuilder.group({
          //ParticipantAssignTypesInterface
          assignTypeId: [at.assignTypeId, Validators.required],
          canPrincipal: [at.canPrincipal, Validators.required],
          canAssistant: [at.canAssistant],
        });
        //Add assignType to the form
        const fa = this.participantForm.get("assignTypes") as FormArray;
        fa.push(assignType);
      }
    );
  }

  onSubmit(): void {
    this.participantService.updateParticipant({
      ...this.participantForm.value,
      notAvailableDates: this.notAvailableDates,
    });

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }

  public dateClass = (date: Date) => {
    if (this.findDate(date) !== -1) {
      return ["selected"];
    }
    return [];
  };

  public dateChanged(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      const date = event.value;
      const index = this.findDate(date);
      if (index === -1) {
        this.notAvailableDates.push(date);
      } else {
        this.notAvailableDates.splice(index, 1);
      }
      this.resetModel = new Date(0);
      if (!this.closeOnSelected) {
        const closeFn = this.datePickerRef.close;
        this.datePickerRef.close = () => {};
        // eslint-disable-next-line no-underscore-dangle
        this.datePickerRef[
          // eslint-disable-next-line @typescript-eslint/dot-notation
          "_componentRef"
        ].instance._calendar.monthView._createWeekCells();
        this.timeoutRef = setTimeout(() => {
          this.datePickerRef.close = closeFn;
        });
        this.cdr.detectChanges();
      }
    }
  }

  public remove(date: Date): void {
    const index = this.findDate(date);
    this.notAvailableDates.splice(index, 1);
  }

  private findDate(date: Date): number {
    return this.notAvailableDates.map((m) => +m).indexOf(+date);
  }
}
