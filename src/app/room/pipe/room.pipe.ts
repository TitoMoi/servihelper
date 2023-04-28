import { Pipe, PipeTransform } from "@angular/core";
import { RoomInterface } from "../model/room.model";
import { RoomService } from "../service/room.service";

@Pipe({
  name: "roomPipe",
  standalone: true,
})
export class RoomPipe implements PipeTransform {
  /**Given the id of the room return the name */
  constructor(private roomService: RoomService) {}
  transform(id: string): RoomInterface {
    return this.roomService.getRoom(id);
  }
}
