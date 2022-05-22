import { NgModule } from "@angular/core";
import { Routes, RouterModule, PreloadAllModules } from "@angular/router";
import { HomeComponent } from "app/home/home.component";
import { ParticipantComponent } from "app/participant/participant.component";
import { CreateParticipantComponent } from "app/participant/create-participant/create-participant.component";
import { UpdateParticipantComponent } from "app/participant/update-participant/update-participant.component";
import { DeleteParticipantComponent } from "app/participant/delete-participant/delete-participant.component";

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    pathMatch: "full",
  },
  {
    path: "home",
    component: HomeComponent,
  },
  {
    path: "room",
    loadChildren: () => import("./room/room.module").then((m) => m.RoomModule),
  },
  {
    path: "assignType",
    loadChildren: () =>
      import("./assignType/assigntype.module").then((m) => m.AssignTypeModule),
  },
  {
    path: "note",
    loadChildren: () => import("./note/note.module").then((m) => m.NoteModule),
  },
  {
    path: "participant",
    component: ParticipantComponent,
  },
  {
    path: "participant/create",
    component: CreateParticipantComponent,
  },
  {
    path: "participant/update/:id",
    component: UpdateParticipantComponent,
  },
  {
    path: "participant/delete/:id",
    component: DeleteParticipantComponent,
  },
  {
    path: "assignment",
    loadChildren: () =>
      import("./assignment/assignment.module").then((m) => m.AssignmentModule),
  },
  {
    path: "search",
    loadChildren: () =>
      import("./search/search.module").then((m) => m.SearchModule),
  },
  {
    path: "statistics",
    loadChildren: () =>
      import("./statistics/statistics.module").then((m) => m.StatisticsModule),
  },
  {
    path: "config",
    loadChildren: () =>
      import("./config/config.module").then((m) => m.ConfigModule),
  },
  {
    path: "qa",
    loadChildren: () =>
      import("./question/question.module").then((m) => m.QuestionModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
