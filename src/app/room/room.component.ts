import { RoomInterface, RoomTableInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";

import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-room",
  templateUrl: "./room.component.html",
  styleUrls: ["./room.component.scss"],
})
export class RoomComponent implements OnInit {
  rooms: RoomInterface[];

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.rooms = this.roomService
      .getRooms()
      .sort((a, b) => (a.order > b.order ? 1 : -1));
  }

  trackByIdFn(index, room: RoomInterface) {
    return room.id;
  }
}
