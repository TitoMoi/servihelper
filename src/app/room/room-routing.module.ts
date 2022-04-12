import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RoomComponent } from "./room.component";
import { CreateRoomComponent } from "./create-room/create-room.component";
import { UpdateRoomComponent } from "./update-room/update-room.component";
import { DeleteRoomComponent } from "./delete-room/delete-room.component";

const routes: Routes = [
  {
    path: "",
    component: RoomComponent,
  },
  {
    path: "create",
    component: CreateRoomComponent,
  },
  {
    path: "update/:id",
    component: UpdateRoomComponent,
  },
  {
    path: "delete/:id",
    component: DeleteRoomComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoomRoutingModule {}
