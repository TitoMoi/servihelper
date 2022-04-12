import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AssignTypeComponent } from "./assigntype.component";
import { CreateAssignTypeComponent } from "./create-assigntype/create-assigntype.component";
import { UpdateAssignTypeComponent } from "./update-assigntype/update-assigntype.component";
import { DeleteAssignTypeComponent } from "./delete-assigntype/delete-assigntype.component";

const routes: Routes = [
  {
    path: "",
    component: AssignTypeComponent,
  },
  {
    path: "create",
    component: CreateAssignTypeComponent,
  },
  {
    path: "update/:id",
    component: UpdateAssignTypeComponent,
  },
  {
    path: "delete/:id",
    component: DeleteAssignTypeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignTypeRoutingModule {}
