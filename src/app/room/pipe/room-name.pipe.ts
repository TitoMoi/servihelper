import { Pipe, PipeTransform } from "@angular/core";
import { RoomInterface } from "../model/room.model";
import { RoomService } from "../service/room.service";

@Pipe({
  name: "roomNamePipe",
  standalone: true,
})
export class RoomNamePipe implements PipeTransform {
  constructor(private roomService: RoomService) {}

  transform(r: RoomInterface): string {
    return this.roomService.getNameOrTranslation(r);
  }
}
