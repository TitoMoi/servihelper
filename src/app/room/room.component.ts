import { Component, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
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

  //icons
  icons: string[];
  constructor(
    private roomService: RoomService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.displayedColumns = ["name", "editIcon", "deleteIcon"];
    this.icons = ["garbage", "edit"];
  }

  async ngOnInit(): Promise<void> {
    //Register icons
    for (const iconFileName of this.icons) {
      this.matIconRegistry.addSvgIcon(
        iconFileName,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          "assets/icons/" + iconFileName + ".svg"
        )
      );
    }

    this.rooms = await this.roomService.getRooms();
    await this.fillDataSource(this.rooms);
  }

  trackByIdFn(index, room: RoomInterface) {
    return room.id;
  }

  async fillDataSource(roomsPage: RoomInterface[]) {
    const dataSourceTemp: RoomTableInterface[] = [];
    for (const room of roomsPage) {
      //Populate datasource, values is in order
      dataSourceTemp.push({
        id: room.id,
        name: room.name,
      });
    }
    //Update the view
    this.dataSource = dataSourceTemp;
  }
}
