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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavigationComponent,
    ParticipantComponent,
    CreateParticipantComponent,
    UpdateParticipantComponent,
    DeleteParticipantComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    AppRoutingModule,
    TranslocoRootModule,
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
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
