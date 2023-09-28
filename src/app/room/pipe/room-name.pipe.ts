import { Injectable, Pipe, PipeTransform } from "@angular/core";
import { RoomInterface } from "../model/room.model";
import { TranslocoService } from "@ngneat/transloco";

//We need the pipe becomes injectable for excel.service.ts
@Pipe({
  name: "roomNamePipe",
  standalone: true,
})
@Injectable({
  providedIn: "root",
})
export class RoomNamePipe implements PipeTransform {
  constructor(private translocoService: TranslocoService) {}

  transform(r: RoomInterface): string {
    if (!r) return this.translocoService.translate("ROOM_UNKNOWN");
    return r.name ? r.name : this.translocoService.translate(r.tKey);
  }
}
