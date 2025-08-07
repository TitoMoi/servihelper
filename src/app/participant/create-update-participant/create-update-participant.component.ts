import { AssignTypeInterface } from 'app/assigntype/model/assigntype.model';
import { AssignTypeService } from 'app/assigntype/service/assigntype.service';
import { ParticipantService } from 'app/participant/service/participant.service';
import { RoomInterface } from 'app/room/model/room.model';
import { RoomService } from 'app/room/service/room.service';

import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerInputEvent,
  MatDatepickerModule
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { TranslocoLocaleModule } from '@ngneat/transloco-locale';
import { S21Service } from 'app/globals/services/s21.service';
import { OnlineService } from 'app/online/service/online.service';
import { RoomNamePipe } from 'app/room/pipe/room-name.pipe';
import { AutoFocusDirective } from '../../directives/autofocus/autofocus.directive';
import { RoomPipe } from '../../room/pipe/room.pipe';
import {
  ParticipantAssignTypeInterface,
  ParticipantRoomInterface
} from '../model/participant.model';

@Component({
  selector: 'app-create-update-participant',
  templateUrl: './create-update-participant.component.html',
  styleUrls: ['./create-update-participant.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    AsyncPipe
  ]
})
export class CreateUpdateParticipantComponent implements OnInit, OnDestroy {
  private formBuilder = inject(FormBuilder);
  private participantService = inject(ParticipantService);
  private roomService = inject(RoomService);
  private assignTypeService = inject(AssignTypeService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private onlineService = inject(OnlineService);
  private snackbar = inject(MatSnackBar);
  private s21Service = inject(S21Service);
  private cdr = inject(ChangeDetectorRef);

  //Angular material datepicker hacked
  @ViewChild(MatDatepicker) datePickerRef: MatDatepicker<Date>;

  rooms: RoomInterface[] = this.roomService.getRooms().sort((a, b) => (a.order > b.order ? 1 : -1));
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

  form = this.formBuilder.group({
    id: this.p?.id,
    name: new FormControl(this.p?.name, {
      validators: Validators.required
    }),
    group: [this.p?.group],
    isWoman: this.p ? this.p.isWoman : false,
    isExternal: this.p ? this.p.isExternal : false,
    assignTypes: this.formBuilder.array<ParticipantAssignTypeInterface>([]), //do not wrap this into an [], because [...] creates a formControl wrapper
    rooms: this.formBuilder.array<ParticipantRoomInterface>([]),
    available: [this.p ? this.p.available : true],
    notAvailableDates: [this.p ? this.p.notAvailableDates : []],
    hasPublisherR: [this.p ? this.p.hasPublisherR : false]
  });

  currentPublisherRegistryName$ = this.s21Service.getParticipantPublisherRegistryName(
    this.form.controls.id.value
  );

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
        available: [r.available, Validators.required]
      });
      //Add assignType to the form
      const fa = this.form.get('rooms') as FormArray;

      fa.push(roomGroup);
    }
  }

  setFormAssignTypes(): void {
    //Populate control with assign types
    for (const at of this.p.assignTypes) {
      const assignType = this.formBuilder.group({
        //ParticipantAssignTypesInterface
        assignTypeId: [at.assignTypeId, Validators.required],
        canPrincipal: [at.canPrincipal, Validators.required],
        canAssistant: [at.canAssistant]
      });
      //Add assignType to the form
      const fa = this.form.get('assignTypes') as FormArray;
      fa.push(assignType);
    }
  }

  addAssignTypes(): void {
    //reset
    this.form.controls.assignTypes = this.formBuilder.array<ParticipantAssignTypeInterface>([]);
    //Populate control with assignTypes
    for (const at of this.assignTypes) {
      this.addAssignType(at);
    }
  }

  addAssignType(a: AssignTypeInterface): void {
    const at = {
      assignTypeId: a.id,
      canPrincipal: true,
      canAssistant: a.hasAssistant
    };

    const assignTypeFormGroup = this.formBuilder.group<ParticipantAssignTypeInterface>(at);

    const fa = this.form.controls.assignTypes as FormArray;

    fa.push(assignTypeFormGroup);
  }

  addRooms(): void {
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
      available: true
    };

    const roomGroup = this.formBuilder.group<ParticipantRoomInterface>(room);

    const fa = this.form.controls.rooms as FormArray;

    fa.push(roomGroup);
  }

  onSubmit(): void {
    this.updateOrCreateParticipant();

    const route = this.isUpdate ? '../..' : '..';
    //navigate to parent
    this.router.navigate([route], {
      relativeTo: this.activatedRoute
    });
  }

  updateOrCreateParticipant(): void {
    if (this.isUpdate) {
      this.participantService.updateParticipant(this.form.getRawValue());
    } else {
      this.createParticipant();
    }
  }

  submitAndCreate(): void {
    this.createParticipant();

    this.form.get('name').reset(undefined, { emitEvent: false });
    this.form.get('isWoman').reset(false, { emitEvent: false });
    this.form.get('isExternal').reset(false, { emitEvent: false });
    this.form.get('notAvailableDates').reset([], { emitEvent: false });
    this.form.get('hasPublisherR').reset(false, { emitEvent: false });
    this.addAssignTypes();
    this.addRooms();
  }

  createParticipant(): void {
    this.participantService.createParticipant(this.form.getRawValue());
  }

  uploadPublisherRegistry(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      //Read file and upload it
      //We assume the file is a pdf file
      //If the file is not a pdf, it will throw an error
      //and the user will be notified
      //We save the file to source/assets/S21 folder
      //and don't overwrite the pdf filename
      const file = input.files[0];
      this.s21Service.uploadPublisherRegistry(file, this.form.controls.id.value).then(() => {
        this.form.controls.hasPublisherR.setValue(true, { emitEvent: false });
        this.updateOrCreateParticipant();
        this.snackbar.open('Publisher registry uploaded successfully', 'Close', {
          duration: 3000
        });
      });
    } else if (input.files && input.files.length === 0) {
      //No file selected
      this.snackbar.open('No file selected', 'Close', {
        duration: 3000
      });
    } else {
      this.snackbar.open('No file selected', 'Close', {
        duration: 3000
      });
    }
  }

  /** code for the datepicker hack*/
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  public dateClass = (date: Date) => {
    if (this.findDate(date) !== -1) {
      return ['selected'];
    }
    return [];
  };

  /** code for the datepicker hack*/
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
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
        this.datePickerRef['_componentRef'].instance._calendar.monthView._createWeekCells();

        this.timeoutRef = setTimeout(() => {
          this.datePickerRef.close = closeFn;
          this.timeoutExecuted = true;
        });
        this.cdr.detectChanges();
      }
    }
  }

  /** code for the datepicker hack*/
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  public remove(date: Date): void {
    const index = this.findDate(date);
    this.getNotAvailableDates.splice(index, 1);
  }

  /** code for the datepicker hack*/
  private findDate(date: Date): number {
    return this.getNotAvailableDates.map(m => +m).indexOf(+date);
  }
}
