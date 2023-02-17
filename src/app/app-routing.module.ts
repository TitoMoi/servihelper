import { AssignmentComponent } from "app/assignment/assignment.component";
import { CreateUpdateAssignmentComponent } from "app/assignment/create-update-assignment/create-update-assignment.component";
import { DeleteAssignmentComponent } from "app/assignment/delete-assignment/delete-assignment.component";
import { ImageAssignmentComponent } from "app/assignment/image-assignment/image-assignment.component";
import { MoveAssignmentComponent } from "app/assignment/move-assignment/move-assignment.component";
import { ReportSelectorComponent } from "app/report/report-selector/report-selector.component";
import { AssignTypeComponent } from "app/assignType/assignType.component";
import { CreateUpdateAssignTypeComponent } from "app/assignType/create-update-assigntype/create-update-assigntype.component";
import { DeleteAssignTypeComponent } from "app/assignType/delete-assigntype/delete-assigntype.component";
import { ConfigComponent } from "app/config/config.component";
import { HomeComponent } from "app/home/home.component";
import { CreateUpdateNoteComponent } from "app/note/create-update-note/create-update-note.component";
import { DeleteNoteComponent } from "app/note/delete-note/delete-note.component";
import { NoteComponent } from "app/note/note.component";
import { CreateParticipantComponent } from "app/participant/create-participant/create-participant.component";
import { DeleteParticipantComponent } from "app/participant/delete-participant/delete-participant.component";
import { ParticipantComponent } from "app/participant/participant.component";
import { UpdateParticipantComponent } from "app/participant/update-participant/update-participant.component";
import { QuestionComponent } from "app/question/question.component";
import { CreateUpdateRoomComponent } from "app/room/create-update-room/create-update-room.component";
import { DeleteRoomComponent } from "app/room/delete-room/delete-room.component";
import { RoomComponent } from "app/room/room.component";
import { SearchComponent } from "app/search/search.component";
import { StatisticsComponent } from "app/statistics/statistics.component";

import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { GroupDeleteAssignmentComponent } from "./assignment/group-delete-assignment/group-delete-assignment.component";
import { CreateFromParticipantComponent } from "./participant/create-from-participant/create-from-participant.component";
import { RolesComponent } from "./roles/roles.component";
import { CreateRoleComponent } from "./roles/create-role/create-role.component";
import { UpdateRoleComponent } from "./roles/update-role/update-role.component";
import { DeleteRoleComponent } from "./roles/delete-role/delete-role.component";

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
    component: CreateUpdateRoomComponent,
  },
  {
    path: "room/update/:id",
    component: CreateUpdateRoomComponent,
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
    component: CreateUpdateAssignTypeComponent,
  },
  {
    path: "assignType/update/:id",
    component: CreateUpdateAssignTypeComponent,
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
    component: CreateUpdateNoteComponent,
  },
  {
    path: "note/update/:id",
    component: CreateUpdateNoteComponent,
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
    path: "participant/create-from",
    component: CreateFromParticipantComponent,
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
      {
        //create is outside of children because we want to destroy assignments and create again with the new assignments
        path: "create",
        component: CreateUpdateAssignmentComponent,
      },
      {
        path: "update/:id",
        component: CreateUpdateAssignmentComponent,
      },
    ],
  },

  {
    path: "assignment/move",
    component: MoveAssignmentComponent,
  },
  {
    path: "assignment/group-delete",
    component: GroupDeleteAssignmentComponent,
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
    path: "role",
    component: RolesComponent,
  },
  {
    path: "role/create",
    component: CreateRoleComponent,
  },
  {
    path: "role/update/:id",
    component: UpdateRoleComponent,
  },
  {
    path: "role/delete/:id",
    component: DeleteRoleComponent,
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
