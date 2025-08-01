import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { ParticipantDynamicInterface } from "app/participant/model/participant.model";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";

import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";
import { RoomPipe } from "app/room/pipe/room.pipe";
import { RoomNamePipe } from "app/room/pipe/room-name.pipe";

@Component({
    selector: "app-info-assignment",
    templateUrl: "./info-assignment.component.html",
    styleUrls: ["./info-assignment.component.scss"],
    imports: [
        TranslocoModule,
        MatDialogModule,
        MatIconModule,
        TranslocoLocaleModule,
        RoomPipe,
        RoomNamePipe,
    ]
})
export class InfoAssignmentComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ParticipantDynamicInterface[]) {}
}
