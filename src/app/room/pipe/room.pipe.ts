import { Pipe, PipeTransform, inject } from "@angular/core";
import { RoomInterface } from "../model/room.model";
import { RoomService } from "../service/room.service";

@Pipe({
  name: "roomPipe",
  standalone: true,
})
export class RoomPipe implements PipeTransform {
  private roomService = inject(RoomService);

  transform(id: string): RoomInterface {
    return this.roomService.getRoom(id);
  }
}
