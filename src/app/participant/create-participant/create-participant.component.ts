import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { RoomInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";
import {
  ParticipantAssignTypesInterface,
  ParticipantInterface,
  ParticipantRoomInterface,
} from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";

@Component({
  selector: "app-create-participant",
  templateUrl: "./create-participant.component.html",
  styleUrls: ["./create-participant.component.css"],
})
export class CreateParticipantComponent implements OnInit {
  rooms: RoomInterface[] = this.roomService.getRooms();
  assignTypes: AssignTypeInterface[] = this.assignTypeService.getAssignTypes();

  isRoomsAvailable: boolean = false;
  isAssignTypesAvailable: boolean = false;

  participantForm = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
    isWoman: [false],
    assignTypes: [this.formBuilder.array([])],
    rooms: [this.formBuilder.array([])],
    available: [true],
  });

  constructor(
    private formBuilder: FormBuilder,
    private participantService: ParticipantService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.addRooms();
    this.addAssignTypes();
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
  onSubmit(participant: ParticipantInterface): void {
    this.participantService.createParticipant(participant);

    //navigate to parent
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }

  submitAndCreate(): void {
    this.participantService.createParticipant(this.participantForm.value);

    /* const date = this.participantForm.get("date").value; */
    this.participantForm.get("name").reset();
    this.participantForm.get("isWoman").reset();
    this.addAssignTypes();
    this.addRooms();
    /* this.assignmentForm.get("date").setValue(date); */
  }
}
