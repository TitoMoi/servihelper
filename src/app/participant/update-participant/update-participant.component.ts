import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, Validators } from "@angular/forms";
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
  selector: "app-update-participant",
  templateUrl: "./update-participant.component.html",
  styleUrls: ["./update-participant.component.css"],
})
export class UpdateParticipantComponent implements OnInit {
  participant: ParticipantInterface;
  rooms: RoomInterface[] = this.roomService.getRooms();
  assignTypes: AssignTypeInterface[] = this.assignTypeService.getAssignTypes();

  participantForm = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
    isWoman: [undefined],
    email: [undefined, Validators.email],
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
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.participant = this.participantService.getParticipant(params.id);
      this.setParticipantValues();
    });
  }

  getRoomName(id) {
    if (this.rooms) {
      const room = this.rooms.filter((r) => r.id === id);
      return room[0].name;
    }
  }

  setParticipantValues() {
    this.participantForm.setValue({
      id: this.participant.id,
      name: this.participant.name,
      isWoman: this.participant.isWoman,
      email: this.participant.email,
      available: this.participant.available,
      rooms: [this.formBuilder.array([])],
      assignTypes: [this.formBuilder.array([])],
    });

    this.setParticipantRooms();
    this.setParticipantAssignTypes();
  }

  //Accesor for the template, not working fine on the ts -> use this.participantForm.get
  get getRoomsForm(): FormArray {
    return this.participantForm.controls.rooms as FormArray;
  }

  //Accesor for the template, not working fine on the ts -> use this.participantForm.get
  get getAssignTypesForm(): FormArray {
    return this.participantForm.controls.assignTypes as FormArray;
  }

  setParticipantRooms() {
    //Create control
    this.participantForm.setControl("rooms", this.formBuilder.array([]));
    //Populate control with rooms
    this.participant.rooms.forEach((r) => {
      const room = this.formBuilder.group({
        //ParticipantRoomInterface
        id: [r.id, Validators.required],
        available: [r.available, Validators.required],
      });
      //Add assignType to the form
      const fa = this.participantForm.get("rooms") as FormArray;
      fa.push(room);
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
          canAssistant: [at.canAssistant, Validators.required],
        });
        //Add assignType to the form
        const fa = this.participantForm.get("assignTypes") as FormArray;
        fa.push(assignType);
      }
    );
  }

  onSubmit(participant: ParticipantInterface): void {
    this.participantService.updateParticipant(participant);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
