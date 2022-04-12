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
  roomForm;

  constructor(
    private formBuilder: FormBuilder,
    private roomService: RoomService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.roomForm = this.formBuilder.group({
      id: undefined,
      name: [undefined, Validators.required],
    });

    this.activatedRoute.params.subscribe((params) => {
      const room = this.roomService.getRoom(params.id);
      this.roomForm.setValue({
        id: params.id,
        name: room.name,
      });
    });
  }

  async onSubmit(room: RoomInterface): Promise<void> {
    //delete room
    await this.roomService.deleteRoom(room.id);

    //delete from participants the room reference
    await this.participantService.deleteRoom(room.id);

    //delete all assignments that have the room
    await this.assignmentService.deleteAssignmentsByRoom(room.id);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
