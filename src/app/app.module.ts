import { HomeComponent } from "app/home/home.component";
import { NavigationComponent } from "app/navigation/navigation.component";
import { ColorPickerModule } from "ngx-color-picker";
import { NgxEditorModule } from "ngx-editor";

import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { DateAdapter, MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AssignmentComponent } from "./assignment/assignment.component";
import { CreateAssignmentComponent } from "./assignment/create-assignment/create-assignment.component";
import { CustomDateAdapter } from "./customDateAdapter";
import { DeleteAssignmentComponent } from "./assignment/delete-assignment/delete-assignment.component";
import { ImageAssignmentComponent } from "./assignment/image-assignment/image-assignment.component";
import { MultipleImageAssignmentComponent } from "./report/multiple-image-assignment/multiple-image-assignment.component";
import { ReportSelectorComponent } from "./report/report-selector/report-selector.component";
import { SelectionListHorComponent } from "./report/selection-list-hor/selection-list-hor.component";
import { SelectionListComponent } from "./report/selection-list/selection-list.component";
import { UpdateAssignmentComponent } from "./assignment/update-assignment/update-assignment.component";
import { AssignTypeComponent } from "./assignType/assignType.component";
import { CreateAssignTypeComponent } from "./assignType/create-assigntype/create-assigntype.component";
import { DeleteAssignTypeComponent } from "./assignType/delete-assigntype/delete-assigntype.component";
import { UpdateAssignTypeComponent } from "./assignType/update-assigntype/update-assigntype.component";
import { AutoFocusModule } from "./autofocus/autofocus.module";
import { ConfigComponent } from "./config/config.component";
import { CreateNoteComponent } from "./note/create-note/create-note.component";
import { DeleteNoteComponent } from "./note/delete-note/delete-note.component";
import { NoteComponent } from "./note/note.component";
import { UpdateNoteComponent } from "./note/update-note/update-note.component";
import { CreateParticipantComponent } from "./participant/create-participant/create-participant.component";
import { DeleteParticipantComponent } from "./participant/delete-participant/delete-participant.component";
import { ParticipantComponent } from "./participant/participant.component";
import { UpdateParticipantComponent } from "./participant/update-participant/update-participant.component";
import { QuestionComponent } from "./question/question.component";
import { CreateRoomComponent } from "./room/create-room/create-room.component";
import { DeleteRoomComponent } from "./room/delete-room/delete-room.component";
import { RoomComponent } from "./room/room.component";
import { UpdateRoomComponent } from "./room/update-room/update-room.component";
import { SearchComponent } from "./search/search.component";
import { AssistantCountComponent } from "./statistics/assistant-count/assistant-count.component";
import { GlobalCountComponent } from "./statistics/global-count/global-count.component";
import { PrincipalCountComponent } from "./statistics/principal-count/principal-count.component";
import { StatisticsComponent } from "./statistics/statistics.component";
import { TranslocoRootModule } from "./transloco/translocoRoot.module";
import { MoveAssignmentComponent } from "./assignment/move-assignment/move-assignment.component";
import { GroupDeleteAssignmentComponent } from "./assignment/group-delete-assignment/group-delete-assignment.component";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    QuestionComponent,
    StatisticsComponent,
    SearchComponent,
    GlobalCountComponent,
    PrincipalCountComponent,
    AssistantCountComponent,
    ConfigComponent,
    NavigationComponent,
    ParticipantComponent,
    CreateParticipantComponent,
    UpdateParticipantComponent,
    DeleteParticipantComponent,
    AssignmentComponent,
    CreateAssignmentComponent,
    UpdateAssignmentComponent,
    DeleteAssignmentComponent,
    ImageAssignmentComponent,
    RoomComponent,
    CreateRoomComponent,
    UpdateRoomComponent,
    DeleteRoomComponent,
    AssignTypeComponent,
    CreateAssignTypeComponent,
    UpdateAssignTypeComponent,
    DeleteAssignTypeComponent,
    NoteComponent,
    CreateNoteComponent,
    UpdateNoteComponent,
    DeleteNoteComponent,
    ReportSelectorComponent,
    SelectionListComponent,
    SelectionListHorComponent,
    MultipleImageAssignmentComponent,
    MoveAssignmentComponent,
    GroupDeleteAssignmentComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    AppRoutingModule,
    TranslocoRootModule,
    TranslocoLocaleModule,
    HttpClientModule,
    ReactiveFormsModule,
    AutoFocusModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    NgxEditorModule,
    ColorPickerModule,
  ],
  providers: [{ provide: DateAdapter, useClass: CustomDateAdapter }],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
