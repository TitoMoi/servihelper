import { ParticipantService } from 'app/participant/service/participant.service';
import { RoomService } from 'app/room/service/room.service';

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: "app-create-room",
  templateUrl: "./create-room.component.html",
  styleUrls: ["./create-room.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRoomComponent {
  roomForm = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
    order: [undefined, Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private roomService: RoomService,
    private participantService: ParticipantService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit(): void {
    //create the room
    const id = this.roomService.createRoom(this.roomForm.value);

    //Create the room reference for all the participants
    this.participantService.addRoom(id);

    //navigate to parent
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }
}
