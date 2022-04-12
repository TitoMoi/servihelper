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
} from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";

@Component({
  selector: "app-create-participant",
  templateUrl: "./create-participant.component.html",
  styleUrls: ["./create-participant.component.css"],
})
export class CreateParticipantComponent implements OnInit {
  rooms: RoomInterface[];
  assignTypes: AssignTypeInterface[];
  participantForm;

  isRoomsAvailable: boolean;
  isAssignTypesAvailable: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private participantService: ParticipantService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.isRoomsAvailable = false;
    this.isAssignTypesAvailable = false;
  }

  ngOnInit(): void {
    this.participantForm = this.formBuilder.group({
      id: undefined,
      name: [undefined, Validators.required],
      isWoman: [false],
      email: [undefined, Validators.email],
      assignTypes: [this.formBuilder.array([])],
      rooms: [this.formBuilder.array([])],
      available: [true],
    });

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

  async addAssignTypes() {
    this.assignTypes = await this.assignTypeService.getAssignTypes();

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

  async addRooms() {
    this.rooms = await this.roomService.getRooms();
    //Create control
    this.participantForm.setControl("rooms", this.formBuilder.array([]));
    //Populate control with rooms
    this.rooms.forEach((r) => this.addRoom(r));

    this.isRoomsAvailable = true;
  }

  addRoom(r: RoomInterface) {
    const room = this.formBuilder.group({
      //ParticipantRoomInterface
      id: [r.id, Validators.required],
      available: [true, Validators.required],
    });

    const fa = this.participantForm.get("rooms") as FormArray;
    fa.push(room);
  }
  async onSubmit(participant: ParticipantInterface): Promise<void> {
    await this.participantService.createParticipant(participant);

    //navigate to parent
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }
}
