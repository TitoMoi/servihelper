import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";

import { HomeComponent } from "app/home/home.component";
import { NavigationComponent } from "app/navigation/navigation.component";
import { AppRoutingModule } from "./app-routing.module";
import { TranslocoRootModule } from "./transloco/translocoRoot.module";
import { AppComponent } from "./app.component";
import { AutoFocusModule } from "./autofocus/autofocus.module";
import { ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatTableModule } from "@angular/material/table";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatCardModule } from "@angular/material/card";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatChipsModule } from "@angular/material/chips";
import { NgxEditorModule } from "ngx-editor";
import { ColorPickerModule } from "ngx-color-picker";

import { ParticipantComponent } from "./participant/participant.component";
import { CreateParticipantComponent } from "./participant/create-participant/create-participant.component";
import { UpdateParticipantComponent } from "./participant/update-participant/update-participant.component";
import { DeleteParticipantComponent } from "./participant/delete-participant/delete-participant.component";
import { AssignmentComponent } from "./assignment/assignment.component";
import { CreateAssignmentComponent } from "./assignment/create-assignment/create-assignment.component";
import { DeleteAssignmentComponent } from "./assignment/delete-assignment/delete-assignment.component";
import { ImageAssignmentComponent } from "./assignment/image-assignment/image-assignment.component";
import { UpdateAssignmentComponent } from "./assignment/update-assignment/update-assignment.component";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { DateAdapter, MatNativeDateModule } from "@angular/material/core";
import { CustomDateAdapter } from "./assignment/customDateAdapter";
import { MatPaginatorModule } from "@angular/material/paginator";
import { RoomComponent } from "./room/room.component";
import { CreateRoomComponent } from "./room/create-room/create-room.component";
import { UpdateRoomComponent } from "./room/update-room/update-room.component";
import { DeleteRoomComponent } from "./room/delete-room/delete-room.component";
import { AssignTypeComponent } from "./assignType/assignType.component";
import { DeleteAssignTypeComponent } from "./assignType/delete-assigntype/delete-assigntype.component";
import { CreateAssignTypeComponent } from "./assignType/create-assigntype/create-assigntype.component";
import { UpdateAssignTypeComponent } from "./assignType/update-assigntype/update-assigntype.component";
import { QuestionComponent } from "./question/question.component";
import { StatisticsComponent } from "./statistics/statistics.component";
import { GlobalCountComponent } from "./statistics/global-count/global-count.component";
import { PrincipalCountComponent } from "./statistics/principal-count/principal-count.component";
import { AssistantCountComponent } from "./statistics/assistant-count/assistant-count.component";
import { NoteComponent } from "./note/note.component";
import { CreateNoteComponent } from "./note/create-note/create-note.component";
import { UpdateNoteComponent } from "./note/update-note/update-note.component";
import { DeleteNoteComponent } from "./note/delete-note/delete-note.component";
import { ConfigComponent } from "./config/config.component";
import { SearchComponent } from "./search/search.component";
import { SelectionSheetsAssignmentComponent } from "./assignment/selection-sheets-assignment/selection-sheets-assignment.component";
import { SelectionListComponent } from "./assignment/selection-list/selection-list.component";
import { SelectionListHorComponent } from "./assignment/selection-list-hor/selection-list-hor.component";
import { MultipleImageAssignmentComponent } from "./assignment/multiple-image-assignment/multiple-image-assignment.component";

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
    SelectionSheetsAssignmentComponent,
    SelectionListComponent,
    SelectionListHorComponent,
    MultipleImageAssignmentComponent,
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
    MatPaginatorModule,
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
