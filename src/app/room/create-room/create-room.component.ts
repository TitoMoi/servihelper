import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";

@Component({
  selector: "app-create-room",
  templateUrl: "./create-room.component.html",
  styleUrls: ["./create-room.component.css"],
})
export class CreateRoomComponent implements OnInit {
  roomForm;

  constructor(
    private formBuilder: FormBuilder,
    private roomService: RoomService,
    private participantService: ParticipantService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.roomForm = this.formBuilder.group({
      id: undefined,
      name: [undefined, Validators.required],
    });
  }

  onSubmit(room: RoomInterface): void {
    //create the room
    this.roomService.createRoom(room);

    //Create the room reference for all the participants
    this.participantService.addRoom(room.id);

    //navigate to parent
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }
}
