import { AssignmentService } from "app/assignment/service/assignment.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";

import { Component } from "@angular/core";
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule } from "@ngneat/transloco";
import { AsyncPipe } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { OnlineService } from "app/online/service/online.service";

@Component({
  selector: "app-delete-room",
  templateUrl: "./delete-room.component.html",
  styleUrls: ["./delete-room.component.css"],
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    AsyncPipe,
    MatIconModule,
  ],
})
export class DeleteRoomComponent {
  room = this.roomService.getRoom(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  form = this.formBuilder.group({
    id: this.room.id,
    name: [{ value: this.room.name, disabled: true }, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private roomService: RoomService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private onlineService: OnlineService,
  ) {}

  onSubmit(room: RoomInterface): void {
    //delete room
    this.roomService.deleteRoom(room.id);

    //delete from participants the room reference
    this.participantService.deleteRoom(room.id);

    //delete all assignments that have the room
    this.assignmentService.deleteAssignmentsByRoom(room.id);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
