import { Component, OnInit } from "@angular/core";
import { RoomInterface, RoomTableInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";

@Component({
  selector: "app-room",
  templateUrl: "./room.component.html",
  styleUrls: ["./room.component.scss"],
})
export class RoomComponent implements OnInit {
  rooms: RoomInterface[];

  //Table
  displayedColumns: string[];

  dataSource: RoomTableInterface[];

  constructor(private roomService: RoomService) {
    this.displayedColumns = ["name", "order", "editIcon", "deleteIcon"];
  }

  ngOnInit(): void {
    this.rooms = this.roomService
      .getRooms()
      .sort((a, b) => (a.order > b.order ? 1 : -1));
    this.fillDataSource(this.rooms);
  }

  trackByIdFn(index, room: RoomInterface) {
    return room.id;
  }

  fillDataSource(roomsPage: RoomInterface[]) {
    const dataSourceTemp: RoomTableInterface[] = [];
    for (const room of roomsPage) {
      //Populate datasource, values is in order
      dataSourceTemp.push({
        id: room.id,
        name: room.name,
        order: room.order,
      });
    }
    //Update the view
    this.dataSource = dataSourceTemp;
  }
}
