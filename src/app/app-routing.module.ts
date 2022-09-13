import { AssignmentComponent } from "app/assignment/assignment.component";
import { CreateAssignmentComponent } from "app/assignment/create-assignment/create-assignment.component";
import { DeleteAssignmentComponent } from "app/assignment/delete-assignment/delete-assignment.component";
import { ImageAssignmentComponent } from "app/assignment/image-assignment/image-assignment.component";
import { ReportSelectorComponent } from "app/report/report-selector/report-selector.component";
import { UpdateAssignmentComponent } from "app/assignment/update-assignment/update-assignment.component";
import { AssignTypeComponent } from "app/assignType/assignType.component";
import { CreateAssignTypeComponent } from "app/assignType/create-assigntype/create-assigntype.component";
import { DeleteAssignTypeComponent } from "app/assignType/delete-assigntype/delete-assigntype.component";
import { UpdateAssignTypeComponent } from "app/assignType/update-assigntype/update-assigntype.component";
import { ConfigComponent } from "app/config/config.component";
import { HomeComponent } from "app/home/home.component";
import { CreateNoteComponent } from "app/note/create-note/create-note.component";
import { DeleteNoteComponent } from "app/note/delete-note/delete-note.component";
import { NoteComponent } from "app/note/note.component";
import { UpdateNoteComponent } from "app/note/update-note/update-note.component";
import { CreateParticipantComponent } from "app/participant/create-participant/create-participant.component";
import { DeleteParticipantComponent } from "app/participant/delete-participant/delete-participant.component";
import { ParticipantComponent } from "app/participant/participant.component";
import { UpdateParticipantComponent } from "app/participant/update-participant/update-participant.component";
import { QuestionComponent } from "app/question/question.component";
import { CreateRoomComponent } from "app/room/create-room/create-room.component";
import { DeleteRoomComponent } from "app/room/delete-room/delete-room.component";
import { RoomComponent } from "app/room/room.component";
import { UpdateRoomComponent } from "app/room/update-room/update-room.component";
import { SearchComponent } from "app/search/search.component";
import { StatisticsComponent } from "app/statistics/statistics.component";

import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

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
    component: RoomComponent,
  },
  {
    path: "room/create",
    component: CreateRoomComponent,
  },
  {
    path: "room/update/:id",
    component: UpdateRoomComponent,
  },
  {
    path: "room/delete/:id",
    component: DeleteRoomComponent,
  },
  {
    path: "assignType",
    component: AssignTypeComponent,
  },
  {
    path: "assignType/create",
    component: CreateAssignTypeComponent,
  },
  {
    path: "assignType/update/:id",
    component: UpdateAssignTypeComponent,
  },
  {
    path: "assignType/delete/:id",
    component: DeleteAssignTypeComponent,
  },
  {
    path: "note",
    component: NoteComponent,
  },
  {
    path: "note/create",
    component: CreateNoteComponent,
  },
  {
    path: "note/update/:id",
    component: UpdateNoteComponent,
  },
  {
    path: "note/delete/:id",
    component: DeleteNoteComponent,
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
    component: AssignmentComponent,
    children: [
      {
        path: "image/:id",
        component: ImageAssignmentComponent,
      },
    ],
  },
  {
    path: "assignment/create",
    component: CreateAssignmentComponent,
  },
  {
    path: "assignment/update/:id",
    component: UpdateAssignmentComponent,
  },
  {
    path: "assignment/delete/:id",
    component: DeleteAssignmentComponent,
  },
  {
    path: "selectionSheets",
    component: ReportSelectorComponent,
  },
  {
    path: "search",
    component: SearchComponent,
  },
  {
    path: "statistics",
    component: StatisticsComponent,
  },
  {
    path: "config",
    component: ConfigComponent,
  },
  {
    path: "info",
    component: QuestionComponent,
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
