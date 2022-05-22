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
import { DateAdapter } from "@angular/material/core";
import { CustomDateAdapter } from "./assignment/customDateAdapter";
import { MatPaginatorModule } from "@angular/material/paginator";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
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
  ],
  providers: [{ provide: DateAdapter, useClass: CustomDateAdapter }],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
