import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { QuestionComponent } from "./question.component";

const routes: Routes = [
  {
    path: "",
    component: QuestionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuestionRoutingModule {}
