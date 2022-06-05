import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormArray, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { RoomInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";
import { ParticipantRoomInterface } from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";
import {
  MatDatepicker,
  MatDatepickerInputEvent,
} from "@angular/material/datepicker";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { DateAdapter } from "@angular/material/core";
import { TranslocoService } from "@ngneat/transloco";
import { Subscription } from "rxjs";

@Component({
  selector: "app-create-participant",
  templateUrl: "./create-participant.component.html",
  styleUrls: ["./create-participant.component.css"],
})
export class CreateParticipantComponent implements OnInit, OnDestroy {
  rooms: RoomInterface[] = this.roomService.getRooms();
  assignTypes: AssignTypeInterface[] = this.assignTypeService.getAssignTypes();

  isRoomsAvailable: boolean = false;
  isAssignTypesAvailable: boolean = false;

  //Icons
  icons: string[] = ["garbage"];

  @ViewChild(MatDatepicker) _picker: MatDatepicker<Date>;

  CLOSE_ON_SELECTED = false;
  init = new Date();
  resetModel = new Date(0);
  notAvailableDates = [];

  timeoutRef;

  langSub$: Subscription;

  participantForm = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
    isWoman: false,
    assignTypes: [this.formBuilder.array([])],
    rooms: [this.formBuilder.array([])],
    available: [true],
  });

  constructor(
    private formBuilder: FormBuilder,
    private participantService: ParticipantService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dateAdapter: DateAdapter<Date>,
    private translocoService: TranslocoService,
    private cdr: ChangeDetectorRef
  ) {
    //Register icons
    for (const iconFileName of this.icons) {
      this.matIconRegistry.addSvgIcon(
        iconFileName,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          "assets/icons/" + iconFileName + ".svg"
        )
      );
    }
  }

  ngOnInit(): void {
    this.addRooms();
    this.addAssignTypes();

    this.dateAdapter.setLocale(this.translocoService.getActiveLang());

    this.langSub$ = this.translocoService.langChanges$.subscribe((lang) => {
      this.dateAdapter.setLocale(lang);
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeoutRef);
    this.langSub$.unsubscribe();
  }

  //Accesor for the template, not working fine on the ts -> use this.participantForm.get
  get getRoomsForm(): FormArray {
    return this.participantForm.controls.rooms as FormArray;
  }

  //Accesor for the template, not working fine on the ts -> use this.participantForm.get
  get getAssignTypesForm(): FormArray {
    return this.participantForm.controls.assignTypes as FormArray;
  }

  addAssignTypes() {
    //Create control
    this.participantForm.setControl("assignTypes", this.formBuilder.array([]));

    //Populate control with rooms
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
      canAssistant: [true, Validators.required],
    });

    const fa = this.participantForm.get("assignTypes") as FormArray;
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
    const fakeParticipantRoom: ParticipantRoomInterface = {
      roomId: "2",
      available: false,
    };

    const room = this.formBuilder.group({
      //the above fakeParticipantRoom reflects these keys, if interface changes update this
      roomId: [r.id, Validators.required],
      available: [true, Validators.required],
    });

    const fa = this.participantForm.get("rooms") as FormArray;
    fa.push(room);
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
      if (!this.CLOSE_ON_SELECTED) {
        const closeFn = this._picker.close;
        this._picker.close = () => {};

        this.cdr.detectChanges();

        this.timeoutRef = setTimeout(() => {
          this._picker.close = closeFn;
        });
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
