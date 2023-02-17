import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";

import { ChangeDetectionStrategy, Component } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-create-update-room",
  templateUrl: "./create-update-room.component.html",
  styleUrls: ["./create-update-room.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateRoomComponent {
  r = this.roomService.getRoom(this.activatedRoute.snapshot.params.id);

  isUpdate = this.r ? true : false;

  form = this.formBuilder.group({
    id: this.r ? this.r.id : undefined,
    name: [this.r ? this.r.name : undefined, Validators.required],
    order: [this.r ? this.r.order : undefined, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private roomService: RoomService,
    private participantService: ParticipantService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit(): void {
    const room = this.form.value;
    if (this.isUpdate) {
      this.roomService.updateRoom(room);
    } else {
      //create the room
      const id = this.roomService.createRoom(room);
      //Create the room reference for all the participants
      this.participantService.addRoom(id);
    }

    //navigate to parent
    const route = this.isUpdate ? "../.." : "..";
    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }
}
