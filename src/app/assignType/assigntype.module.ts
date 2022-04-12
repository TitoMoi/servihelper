import { NgModule } from "@angular/core";
import { MatTableModule } from "@angular/material/table";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";
import { AutoFocusModule } from "app/autofocus/autofocus.module";
import { AssignTypeComponent } from "./assigntype.component";
import { AssignTypeRoutingModule } from "./assigntype-routing.module";
import { UpdateAssignTypeComponent } from "./update-assigntype/update-assigntype.component";
import { CreateAssignTypeComponent } from "./create-assigntype/create-assigntype.component";
import { DeleteAssignTypeComponent } from "./delete-assigntype/delete-assigntype.component";

@NgModule({
  declarations: [
    AssignTypeComponent,
    CreateAssignTypeComponent,
    UpdateAssignTypeComponent,
    DeleteAssignTypeComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    AssignTypeRoutingModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    AutoFocusModule,
  ],
})
export class AssignTypeModule {}
