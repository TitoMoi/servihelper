import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ParticipantComponent } from "./participant.component";
import { CreateParticipantComponent } from "./create-participant/create-participant.component";
import { UpdateParticipantComponent } from "./update-participant/update-participant.component";
import { DeleteParticipantComponent } from "./delete-participant/delete-participant.component";

const routes: Routes = [
  {
    path: "",
    component: ParticipantComponent,
  },
  {
    path: "create",
    component: CreateParticipantComponent,
  },
  {
    path: "update/:id",
    component: UpdateParticipantComponent,
  },
  {
    path: "delete/:id",
    component: DeleteParticipantComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParticipantRoutingModule {}
