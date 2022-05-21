import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";

@Component({
  selector: "app-delete-room",
  templateUrl: "./delete-room.component.html",
  styleUrls: ["./delete-room.component.css"],
})
export class DeleteRoomComponent implements OnInit {
  roomForm = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private roomService: RoomService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const room = this.roomService.getRoom(
      this.activatedRoute.snapshot.params.id
    );
    this.roomForm.setValue({
      id: room.id,
      name: room.name,
    });
  }

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
