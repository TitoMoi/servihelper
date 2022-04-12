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
import { NgxEditorModule } from "ngx-editor";
import { AutoFocusModule } from "app/autofocus/autofocus.module";
import { NoteRoutingModule } from "./note-routing.module";
import { NoteComponent } from "./note.component";
import { UpdateNoteComponent } from "./update-note/update-note.component";
import { CreateNoteComponent } from "./create-note/create-note.component";
import { DeleteNoteComponent } from "./delete-note/delete-note.component";
@NgModule({
  declarations: [
    NoteComponent,
    CreateNoteComponent,
    UpdateNoteComponent,
    DeleteNoteComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    NoteRoutingModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    AutoFocusModule,
    NgxEditorModule,
  ],
})
export class NoteModule {}
