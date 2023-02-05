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
import {
  UntypedFormArray,
  UntypedFormBuilder,
  Validators,
} from "@angular/forms";
import {
  MatDatepicker,
  MatDatepickerInputEvent,
} from "@angular/material/datepicker";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-create-participant",
  templateUrl: "./create-participant.component.html",
  styleUrls: ["./create-participant.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateParticipantComponent implements OnInit, OnDestroy {
  //Angular material datepicker hacked
  @ViewChild(MatDatepicker) datePickerRef: MatDatepicker<Date>;

  rooms: RoomInterface[] = this.roomService
    .getRooms()
    .sort((a, b) => (a.order > b.order ? 1 : -1));
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  isRoomsAvailable = false;
  isAssignTypesAvailable = false;

  closeOnSelected = false;
  init = new Date();
  resetModel = new Date(0);
  notAvailableDates = [];
  timeoutRef;

  participantForm = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
    isWoman: false,
    isExternal: false,
    assignTypes: [this.formBuilder.array([])],
    rooms: [this.formBuilder.array([])],
    available: [true],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private participantService: ParticipantService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  //Accesor for the template, not working fine on the ts -> use this.participantForm.get
  get getRoomsForm(): UntypedFormArray {
    return this.participantForm.controls.rooms as UntypedFormArray;
  }

  //Accesor for the template, not working fine on the ts -> use this.participantForm.get
  get getAssignTypesForm(): UntypedFormArray {
    return this.participantForm.controls.assignTypes as UntypedFormArray;
  }

  ngOnInit(): void {
    this.addRooms();
    this.addAssignTypes();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeoutRef);
  }

  addAssignTypes() {
    //Create control
    this.participantForm.setControl("assignTypes", this.formBuilder.array([]));

    //Populate control with assignTypes
    for (const at of this.assignTypes) {
      this.addAssignType(at);
    }
    this.isAssignTypesAvailable = true;
  }

  addAssignType(a: AssignTypeInterface) {
    const assignTypeFormGroup = this.formBuilder.group({
      //ParticipantAssignTypesInterface
      assignTypeId: [a.id, Validators.required],
      canPrincipal: [true, Validators.required],
      canAssistant: [a.hasAssistant],
    });

    const fa = this.participantForm.get("assignTypes") as UntypedFormArray;
    fa.push(assignTypeFormGroup);
  }

  addRooms() {
    //Create control
    this.participantForm.setControl("rooms", this.formBuilder.array([]));
    //Populate control with rooms
    this.rooms.forEach((r) => this.addRoom(r));

    this.isRoomsAvailable = true;
  }

  addRoom(r: RoomInterface) {
    const room = this.formBuilder.group({
      //the above fakeParticipantRoom reflects these keys, if interface changes update this
      roomId: [r.id, Validators.required],
      available: [true, Validators.required],
    });

    const fa = this.participantForm.get("rooms") as UntypedFormArray;
    fa.push(room);
  }

  getRoom(id): RoomInterface {
    return this.roomService.getRoom(id);
  }

  getAssignType(id): AssignTypeInterface {
    return this.assignTypeService.getAssignType(id);
  }

  createParticipant() {
    this.participantService.createParticipant({
      ...this.participantForm.value,
      notAvailableDates: this.notAvailableDates,
    });
  }
  onSubmit(): void {
    this.createParticipant();
    //navigate to parent
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }

  submitAndCreate(): void {
    this.createParticipant();

    this.participantForm.get("name").reset();
    this.participantForm.get("isWoman").reset(false);
    this.participantForm.get("isExternal").reset(false);
    this.addAssignTypes();
    this.addRooms();

    this.notAvailableDates = [];
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
