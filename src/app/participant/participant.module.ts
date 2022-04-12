import { NgModule } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTableModule } from "@angular/material/table";
import { TranslocoModule } from "@ngneat/transloco";
import { AutoFocusModule } from "app/autofocus/autofocus.module";
import { ParticipantRoutingModule } from "./participant-routing.module";
import { ParticipantComponent } from "./participant.component";
import { UpdateParticipantComponent } from "./update-participant/update-participant.component";
import { CreateParticipantComponent } from "./create-participant/create-participant.component";
import { DeleteParticipantComponent } from "./delete-participant/delete-participant.component";

/* import { BrowserAnimationsModule } from "@angular/platform-browser/animations"; */

@NgModule({
  declarations: [
    ParticipantComponent,
    CreateParticipantComponent,
    UpdateParticipantComponent,
    DeleteParticipantComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    ParticipantRoutingModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    AutoFocusModule,
  ],
})
export class ParticipantModule {}
