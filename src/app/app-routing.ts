import { AssignmentComponent } from "app/assignment/assignment.component";
import { CreateUpdateAssignmentComponent } from "app/assignment/create-update-assignment/create-update-assignment.component";
import { DeleteAssignmentComponent } from "app/assignment/delete-assignment/delete-assignment.component";
import { ImageAssignmentComponent } from "app/assignment/image-assignment/image-assignment.component";
import { MoveAssignmentComponent } from "app/assignment/move-assignment/move-assignment.component";
import { ReportSelectorComponent } from "app/report/report-selector/report-selector.component";
import { AssignTypeComponent } from "app/assigntype/assigntype.component";
import { CreateUpdateAssignTypeComponent } from "app/assigntype/create-update-assigntype/create-update-assigntype.component";
import { DeleteAssignTypeComponent } from "app/assigntype/delete-assigntype/delete-assigntype.component";
import { ConfigComponent } from "app/config/config.component";
import { HomeComponent } from "app/home/home.component";
import { CreateUpdateNoteComponent } from "app/note/create-update-note/create-update-note.component";
import { DeleteNoteComponent } from "app/note/delete-note/delete-note.component";
import { NoteComponent } from "app/note/note.component";
import { CreateUpdateParticipantComponent } from "app/participant/create-update-participant/create-update-participant.component";
import { DeleteParticipantComponent } from "app/participant/delete-participant/delete-participant.component";
import { ParticipantComponent } from "app/participant/participant.component";
import { QuestionComponent } from "app/question/question.component";
import { CreateUpdateRoomComponent } from "app/room/create-update-room/create-update-room.component";
import { DeleteRoomComponent } from "app/room/delete-room/delete-room.component";
import { RoomComponent } from "app/room/room.component";
import { SearchComponent } from "app/search/search.component";
import { StatisticsComponent } from "app/statistics/statistics.component";

import { Routes } from "@angular/router";
import { GroupDeleteAssignmentComponent } from "./assignment/group-delete-assignment/group-delete-assignment.component";
import { CreateFromParticipantComponent } from "./participant/create-from-participant/create-from-participant.component";
import { RolesComponent } from "./roles/roles.component";
import { CreateUpdateRoleComponent } from "./roles/create-update-role/create-update-role.component";
import { DeleteRoleComponent } from "./roles/delete-role/delete-role.component";
import { CreateUpdateSheetTitleComponent } from "app/sheet-title/create-update-sheet-title/create-update-sheet-title.component";
import { DeleteSheetTitleComponent } from "app/sheet-title/delete-sheet-title/delete-sheet-title.component";
import { MapComponent } from "app/map/map.component";
import { CreateUpdateTerritoryComponent } from "app/map/territory/create-update-territory/create-update-territory.component";
import { CreateUpdateTerritoryGroupComponent } from "app/map/territory-group/create-update-territory-group/create-update-territory-group.component";
import { TerritoryComponent } from "app/map/territory/territory.component";
import { TerritoryGroupComponent } from "app/map/territory-group/territory-group.component";
import { DeleteTerritoryGroupComponent } from "app/map/territory-group/delete-territory-group/delete-territory-group.component";
import { DeleteTerritoryComponent } from "app/map/territory/delete-territory/delete-territory.component";
import { ReturnTerritoryComponent } from "app/map/territory/return-territory/return-territory.component";
import { HeatmapComponent } from "app/map/territory/heatmap/heatmap.component";

export const routes: Routes = [
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
    component: CreateUpdateParticipantComponent,
  },
  {
    path: "participant/create-from",
    component: CreateFromParticipantComponent,
  },
  {
    path: "participant/update/:id",
    component: CreateUpdateParticipantComponent,
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
        path: "create",
        component: CreateUpdateAssignmentComponent,
      },
      {
        path: "update/:id",
        component: CreateUpdateAssignmentComponent,
      },
      {
        path: "delete/:id",
        component: DeleteAssignmentComponent,
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
    path: "config/createTitle",
    component: CreateUpdateSheetTitleComponent,
  },
  {
    path: "config/updateTitle/:id",
    component: CreateUpdateSheetTitleComponent,
  },
  {
    path: "config/deleteTitle/:id",
    component: DeleteSheetTitleComponent,
  },
  {
    path: "role",
    component: RolesComponent,
  },
  {
    path: "role/create",
    component: CreateUpdateRoleComponent,
  },
  {
    path: "role/update/:id",
    component: CreateUpdateRoleComponent,
  },
  {
    path: "role/delete/:id",
    component: DeleteRoleComponent,
  },
  {
    path: "info",
    component: QuestionComponent,
  },
  {
    path: "map",
    component: MapComponent,
    children: [
      {
        path: "territory",
        component: TerritoryComponent,
      },
      {
        path: "territory/create",
        component: CreateUpdateTerritoryComponent,
      },
      {
        path: "territory/update/:id",
        component: CreateUpdateTerritoryComponent,
      },
      {
        path: "territory/delete/:id",
        component: DeleteTerritoryComponent,
      },
      {
        path: "territory/return/:id",
        component: ReturnTerritoryComponent,
      },
      {
        path: "territory/heatmap",
        component: HeatmapComponent,
      },
      {
        path: "territoryGroup",
        component: TerritoryGroupComponent,
      },
      {
        path: "territoryGroup/create",
        component: CreateUpdateTerritoryGroupComponent,
      },
      {
        path: "territoryGroup/update/:id",
        component: CreateUpdateTerritoryGroupComponent,
      },
      {
        path: "territoryGroup/delete/:id",
        component: DeleteTerritoryGroupComponent,
      },
    ],
  },
];
