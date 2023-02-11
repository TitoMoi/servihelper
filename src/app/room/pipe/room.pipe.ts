import { Pipe, PipeTransform } from "@angular/core";
import { RoomService } from "../service/room.service";

@Pipe({
  name: "roomPipe",
})
export class RoomPipe implements PipeTransform {
  /**Given the id of the room return the name */
  constructor(private roomService: RoomService) {}
  transform(id: string): string {
    return this.roomService.getRoom(id)?.name;
  }
}
