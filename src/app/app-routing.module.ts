import { NgModule } from "@angular/core";
import { Routes, RouterModule, PreloadAllModules } from "@angular/router";
import { HomeComponent } from "app/home/home.component";
import { ParticipantComponent } from "app/participant/participant.component";
import { CreateParticipantComponent } from "app/participant/create-participant/create-participant.component";
import { UpdateParticipantComponent } from "app/participant/update-participant/update-participant.component";
import { DeleteParticipantComponent } from "app/participant/delete-participant/delete-participant.component";
import { RoomComponent } from "app/room/room.component";
import { CreateRoomComponent } from "app/room/create-room/create-room.component";
import { UpdateRoomComponent } from "app/room/update-room/update-room.component";
import { DeleteRoomComponent } from "app/room/delete-room/delete-room.component";
import { AssignTypeComponent } from "app/assignType/assignType.component";
import { CreateAssignTypeComponent } from "app/assignType/create-assigntype/create-assigntype.component";
import { UpdateAssignTypeComponent } from "app/assignType/update-assigntype/update-assigntype.component";
import { DeleteAssignTypeComponent } from "app/assignType/delete-assigntype/delete-assigntype.component";
import { NoteComponent } from "app/note/note.component";
import { CreateNoteComponent } from "app/note/create-note/create-note.component";
import { UpdateNoteComponent } from "app/note/update-note/update-note.component";
import { DeleteNoteComponent } from "app/note/delete-note/delete-note.component";
import { AssignmentComponent } from "app/assignment/assignment.component";
import { CreateAssignmentComponent } from "app/assignment/create-assignment/create-assignment.component";
import { UpdateAssignmentComponent } from "app/assignment/update-assignment/update-assignment.component";
import { DeleteAssignmentComponent } from "app/assignment/delete-assignment/delete-assignment.component";
import { ImageAssignmentComponent } from "app/assignment/image-assignment/image-assignment.component";
import { SearchComponent } from "app/search/search.component";
import { StatisticsComponent } from "app/statistics/statistics.component";
import { ConfigComponent } from "app/config/config.component";
import { QuestionComponent } from "app/question/question.component";
import { ReportSelectorComponent } from "app/assignment/report-selector/report-selector.component";

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
    path: "assignment/image/:id",
    component: ImageAssignmentComponent,
  },
  {
    path: "assignment/selectionSheets",
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
