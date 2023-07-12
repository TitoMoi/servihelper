import { editorJsonToHtml } from "app/functions/editorJsonToHtml";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { Editor, Toolbar, NgxEditorModule } from "ngx-editor";

import { Component, OnDestroy } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { AutoFocusDirective } from "../../autofocus/autofocus.directive";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { TranslocoModule } from "@ngneat/transloco";

@Component({
  selector: "app-create-update-note",
  templateUrl: "./create-update-note.component.html",
  styleUrls: ["./create-update-note.component.css"],
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    AutoFocusDirective,
    NgxEditorModule,
    MatButtonModule,
    RouterLink,
  ],
})
export class CreateUpdateNoteComponent implements OnDestroy {
  n = this.noteService.getNote(this.activatedRoute.snapshot.params.id);

  isUpdate = this.n ? true : false;

  editor: Editor = new Editor();
  toolbar: Toolbar = [["bold"], ["italic"], ["underline"]];

  form: UntypedFormGroup = this.formBuilder.group({
    id: this.n?.id,
    name: [this.n?.name, Validators.required],
    editorContent: this.n
      ? this.n.editorContent
      : new UntypedFormControl({ value: undefined, disabled: false }, Validators.required),
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private noteService: NoteService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  onSubmit(): void {
    const note: NoteInterface = this.form.value;

    note.editorHTML = editorJsonToHtml(note.editorContent);

    if (this.isUpdate) {
      this.noteService.updateNote(note);
    } else {
      this.noteService.createNote(note);
    }

    const route = this.isUpdate ? "../.." : "..";
    //navigate to parent
    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }
}
