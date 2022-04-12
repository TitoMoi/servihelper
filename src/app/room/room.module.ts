import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatTableModule } from "@angular/material/table";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { TranslocoModule } from "@ngneat/transloco";
import { AutoFocusModule } from "app/autofocus/autofocus.module";
import { RoomRoutingModule } from "./room-routing.module";
import { UpdateRoomComponent } from "./update-room/update-room.component";
import { CreateRoomComponent } from "./create-room/create-room.component";
import { DeleteRoomComponent } from "./delete-room/delete-room.component";
import { RoomComponent } from "./room.component";

@NgModule({
  declarations: [
    RoomComponent,
    CreateRoomComponent,
    UpdateRoomComponent,
    DeleteRoomComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    RoomRoutingModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    AutoFocusModule,
  ],
})
export class RoomModule {}
