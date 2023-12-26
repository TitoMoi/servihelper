import { AssignTypeInterface } from "app/assigntype/model/assigntype.model";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
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
  FormArray,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from "@angular/forms";
import {
  MatDatepicker,
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from "@angular/material/datepicker";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import {
  ParticipantRoomInterface,
  ParticipantAssignTypeInterface,
} from "../model/participant.model";
import { RoomPipe } from "../../room/pipe/room.pipe";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { AsyncPipe } from "@angular/common";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { AutoFocusDirective } from "../../directives/autofocus/autofocus.directive";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule } from "@ngneat/transloco";
import { MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import { RoomNamePipe } from "app/room/pipe/room-name.pipe";
import { OnlineService } from "app/online/service/online.service";

@Component({
  selector: "app-create-update-participant",
  templateUrl: "./create-update-participant.component.html",
  styleUrls: ["./create-update-participant.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    AutoFocusDirective,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatDatepickerModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    RouterLink,
    TranslocoLocaleModule,
    RoomPipe,
    RoomNamePipe,
    AsyncPipe,
  ],
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

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  p = this.participantService.getParticipant(this.activatedRoute.snapshot.params.id);

  isUpdate = this.p ? true : false;

  closeOnSelected = false;
  init = new Date();
  resetModel = new Date(0);
  timeoutRef;
  timeoutExecuted = true; //first time

  form = this.formBuilder.group(
    {
      id: this.p?.id,
      name: new FormControl(this.p?.name, {
        validators: Validators.required,
        updateOn: "blur",
      }),
      group: [this.p?.group],
      isWoman: this.p ? this.p.isWoman : false,
      isExternal: this.p ? this.p.isExternal : false,
      assignTypes: this.formBuilder.array<ParticipantAssignTypeInterface>([]), //do not wrap this into an [], because [...] creates a formControl wrapper
      rooms: this.formBuilder.array<ParticipantRoomInterface>([]),
      available: [this.p ? this.p.available : true],
      notAvailableDates: [this.p ? this.p.notAvailableDates : []],
    },
    {
      updateOn: "blur",
    }
  );

  constructor(
    private formBuilder: FormBuilder,
    private participantService: ParticipantService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private onlineService: OnlineService,
    private cdr: ChangeDetectorRef
  ) {}

  get getRoomsArray(): ParticipantRoomInterface[] {
    //rooms is the FormArray, value is the array
    return this.form.controls.rooms.value;
  }

  get getAssignTypesArray(): ParticipantAssignTypeInterface[] {
    //assignTypes is the FormArray, value is the array
    return this.form.controls.assignTypes.value;
  }

  /** Returns [] */
  get getNotAvailableDates() {
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
    for (const r of this.p.rooms) {
      const roomGroup = this.formBuilder.group({
        //ParticipantRoomInterface
        roomId: [r.roomId, Validators.required],
        available: [r.available, Validators.required],
      });
      //Add assignType to the form
      const fa = this.form.get("rooms") as FormArray;

      fa.push(roomGroup);
    }
  }

  setFormAssignTypes() {
    //Populate control with assign types
    for (const at of this.p.assignTypes) {
      const assignType = this.formBuilder.group({
        //ParticipantAssignTypesInterface
        assignTypeId: [at.assignTypeId, Validators.required],
        canPrincipal: [at.canPrincipal, Validators.required],
        canAssistant: [at.canAssistant],
      });
      //Add assignType to the form
      const fa = this.form.get("assignTypes") as FormArray;
      fa.push(assignType);
    }
  }

  addAssignTypes() {
    //reset
    this.form.controls.assignTypes = this.formBuilder.array<ParticipantAssignTypeInterface>(
      []
    );
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

    const assignTypeFormGroup = this.formBuilder.group<ParticipantAssignTypeInterface>(at);

    const fa = this.form.controls.assignTypes as FormArray;

    fa.push(assignTypeFormGroup);
  }

  addRooms() {
    //reset
    this.form.controls.rooms = this.formBuilder.array<ParticipantRoomInterface>([]);
    //Populate control with rooms
    for (const r of this.rooms) {
      this.addRoom(r);
    }
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
      this.participantService.updateParticipant(this.form.getRawValue());
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

    this.form.get("name").reset(undefined, { emitEvent: false });
    this.form.get("isWoman").reset(false, { emitEvent: false });
    this.form.get("isExternal").reset(false, { emitEvent: false });
    this.form.get("notAvailableDates").reset([], { emitEvent: false });
    this.addAssignTypes();
    this.addRooms();
  }

  createParticipant() {
    this.participantService.createParticipant(this.form.getRawValue());
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
    if (event.value && this.timeoutExecuted) {
      this.timeoutExecuted = false;
      const date = event.value;
      const index = this.findDate(date);
      if (index === -1) {
        this.getNotAvailableDates.push(date);
      } else {
        this.getNotAvailableDates.splice(index, 1);
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
          this.timeoutExecuted = true;
        });
        this.cdr.detectChanges();
      }
    }
  }

  /** code for the datepicker hack*/
  public remove(date: Date): void {
    const index = this.findDate(date);
    this.getNotAvailableDates.splice(index, 1);
  }

  /** code for the datepicker hack*/
  private findDate(date: Date): number {
    return this.getNotAvailableDates.map((m) => +m).indexOf(+date);
  }
}
