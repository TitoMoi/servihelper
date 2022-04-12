import { NgModule } from "@angular/core";
import { PlatformModule } from "@angular/cdk/platform";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { DateAdapter, MatNativeDateModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { TranslocoModule } from "@ngneat/transloco";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { AutoFocusModule } from "app/autofocus/autofocus.module";
import { AssignmentRoutingModule } from "./assignment-routing.module";
import { AssignmentComponent } from "./assignment.component";
import { UpdateAssignmentComponent } from "./update-assignment/update-assignment.component";
import { CreateAssignmentComponent } from "./create-assignment/create-assignment.component";
import { DeleteAssignmentComponent } from "./delete-assignment/delete-assignment.component";
import { ImageAssignmentComponent } from "./image-assignment/image-assignment.component";
import { CustomDateAdapter } from "./customDateAdapter";
@NgModule({
  declarations: [
    AssignmentComponent,
    CreateAssignmentComponent,
    UpdateAssignmentComponent,
    DeleteAssignmentComponent,
    ImageAssignmentComponent,
  ],
  providers: [{ provide: DateAdapter, useClass: CustomDateAdapter }],

  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    TranslocoLocaleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    AssignmentRoutingModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    PlatformModule,
    AutoFocusModule,
  ],
})
export class AssignmentModule {}
