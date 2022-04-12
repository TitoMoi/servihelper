import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AssignmentComponent } from "./assignment.component";
import { CreateAssignmentComponent } from "./create-assignment/create-assignment.component";
import { UpdateAssignmentComponent } from "./update-assignment/update-assignment.component";
import { DeleteAssignmentComponent } from "./delete-assignment/delete-assignment.component";
import { ImageAssignmentComponent } from "./image-assignment/image-assignment.component";

const routes: Routes = [
  {
    path: "",
    component: AssignmentComponent,
  },
  {
    path: "create",
    component: CreateAssignmentComponent,
  },
  {
    path: "update/:id",
    component: UpdateAssignmentComponent,
  },
  {
    path: "delete/:id",
    component: DeleteAssignmentComponent,
  },
  {
    path: "image/:id",
    component: ImageAssignmentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignmentRoutingModule {}
