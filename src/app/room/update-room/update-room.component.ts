import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { RoomInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";

@Component({
  selector: "app-update-room",
  templateUrl: "./update-room.component.html",
  styleUrls: ["./update-room.component.css"],
})
export class UpdateRoomComponent implements OnInit {
  roomForm: FormGroup = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private roomService: RoomService,
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
    this.roomService.updateRoom(room);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
