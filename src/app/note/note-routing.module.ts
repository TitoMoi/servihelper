import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NoteComponent } from "./note.component";
import { CreateNoteComponent } from "./create-note/create-note.component";
import { UpdateNoteComponent } from "./update-note/update-note.component";
import { DeleteNoteComponent } from "./delete-note/delete-note.component";

const routes: Routes = [
  {
    path: "",
    component: NoteComponent,
  },
  {
    path: "create",
    component: CreateNoteComponent,
  },
  {
    path: "update/:id",
    component: UpdateNoteComponent,
  },
  {
    path: "delete/:id",
    component: DeleteNoteComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoteRoutingModule {}
