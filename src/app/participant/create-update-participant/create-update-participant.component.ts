import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
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
import {
  ParticipantRoomInterface,
  ParticipantAssignTypeInterface,
} from "../model/participant.model";

@Component({
  selector: "app-create-update-participant",
  templateUrl: "./create-update-participant.component.html",
  styleUrls: ["./create-update-participant.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateParticipantComponent implements OnInit, OnDestroy {
  //Angular material datepicker hacked
  @ViewChild(MatDatepicker) datePickerRef: MatDatepicker<Date>;

  rooms: RoomInterface[] = this.roomService
    .getRooms()
    .sort((a, b) => (a.order > b.order ? 1 : -1));
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  p = this.participantService.getParticipant(
    this.activatedRoute.snapshot.params.id
  );

  isUpdate = this.p ? true : false;

  closeOnSelected = false;
  init = new Date();
  resetModel = new Date(0);
  notAvailableDates = [];
  timeoutRef;

  form = this.formBuilder.group({
    id: this.p ? this.p.id : undefined,
    name: [this.p ? this.p.name : undefined, Validators.required],
    isWoman: this.p ? this.p.isWoman : false,
    isExternal: this.p ? this.p.isExternal : undefined,
    assignTypes: this.formBuilder.array<ParticipantAssignTypeInterface>([]), //do not wrap this into an [], because [...] creates a formControl wrapper
    rooms: this.formBuilder.array<ParticipantRoomInterface>([]),
    available: [this.p ? this.p.available : true],
    notAvailableDates: [this.p ? this.p.notAvailableDates : []],
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

  /** Returns FormArray */
  get getRoomsArray(): ParticipantRoomInterface[] {
    //rooms is the FormArray, value is the array
    return this.form.controls.rooms.value;
  }

  /** Returns FormArray */
  get getAssignTypesArray(): ParticipantAssignTypeInterface[] {
    //assignTypes is the FormArray, value is the array
    return this.form.controls.assignTypes.value;
  }

  /** Returns [] */
  get getNotAvailableDates(): string[] {
    return this.form.controls.notAvailableDates.value;
  }

  ngOnInit(): void {
    if (this.isUpdate) {
      this.setFormRooms();
      this.setFormAssignTypes();
    } else {
      this.addRooms();
      this.addAssignTypes();
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeoutRef);
  }

  setFormRooms() {
    //Populate control with rooms
    this.p.rooms.forEach((r: ParticipantRoomInterface) => {
      const roomGroup = this.formBuilder.group({
        //ParticipantRoomInterface
        roomId: [r.roomId, Validators.required],
        available: [r.available, Validators.required],
      });
      //Add assignType to the form
      const fa = this.form.get("rooms") as FormArray;

      fa.push(roomGroup);
    });
  }

  setFormAssignTypes() {
    //Populate control with rooms
    this.p.assignTypes.forEach((at: ParticipantAssignTypeInterface) => {
      const assignType = this.formBuilder.group({
        //ParticipantAssignTypesInterface
        assignTypeId: [at.assignTypeId, Validators.required],
        canPrincipal: [at.canPrincipal, Validators.required],
        canAssistant: [at.canAssistant],
      });
      //Add assignType to the form
      const fa = this.form.get("assignTypes") as FormArray;
      fa.push(assignType);
    });
  }

  addAssignTypes() {
    //Populate control with assignTypes
    for (const at of this.assignTypes) {
      this.addAssignType(at);
    }
  }

  addAssignType(a: AssignTypeInterface) {
    const at = {
      assignTypeId: a.id,
      canPrincipal: true,
      canAssistant: a.hasAssistant,
    };

    const assignTypeFormGroup =
      this.formBuilder.group<ParticipantAssignTypeInterface>(at);

    const fa = this.form.controls.assignTypes as FormArray;

    fa.push(assignTypeFormGroup);
  }

  addRooms() {
    //Populate control with rooms
    this.rooms.forEach((r) => this.addRoom(r));
  }

  addRoom(r: RoomInterface) {
    const room: ParticipantRoomInterface = {
      roomId: r.id,
      available: true,
    };

    const roomGroup = this.formBuilder.group<ParticipantRoomInterface>(room);

    const fa = this.form.controls.rooms as FormArray;

    fa.push(roomGroup);
  }

  onSubmit(): void {
    if (this.isUpdate) {
      /*  this.participantService.updateParticipant(this.form.getRawValue()); */
    } else {
      this.createParticipant();
    }

    const route = this.isUpdate ? "../.." : "..";
    //navigate to parent
    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }

  submitAndCreate(): void {
    this.createParticipant();

    this.form.get("name").reset(undefined);
    this.form.get("isWoman").reset(false);
    this.form.get("isExternal").reset(false);
    this.addAssignTypes();
    this.addRooms();

    this.notAvailableDates = [];
  }

  createParticipant() {
    /*  this.participantService.createParticipant(this.form.getRawValue()); */
  }

  /** code for the datepicker hack*/
  public dateClass = (date: Date) => {
    if (this.findDate(date) !== -1) {
      return ["selected"];
    }
    return [];
  };

  /** code for the datepicker hack*/
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

  /** code for the datepicker hack*/
  public remove(date: Date): void {
    const index = this.findDate(date);
    this.notAvailableDates.splice(index, 1);
  }

  /** code for the datepicker hack*/
  private findDate(date: Date): number {
    return this.notAvailableDates.map((m) => +m).indexOf(+date);
  }
}
