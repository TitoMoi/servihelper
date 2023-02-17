import { editorJsonToHtml } from "app/functions/editorJsonToHtml";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { Editor, Toolbar } from "ngx-editor";

import { Component, OnDestroy } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-create-update-note",
  templateUrl: "./create-update-note.component.html",
  styleUrls: ["./create-update-note.component.css"],
})
export class CreateUpdateNoteComponent implements OnDestroy {
  n = this.noteService.getNote(this.activatedRoute.snapshot.params.id);

  isUpdate = this.n ? true : false;

  editor: Editor = new Editor();
  toolbar: Toolbar = [["bold"], ["italic"], ["underline"]];

  form: UntypedFormGroup = this.formBuilder.group({
    id: this.n ? this.n.id : undefined,
    name: [this.n ? this.n.name : undefined, Validators.required],
    editorContent: this.n
      ? this.n.editorContent
      : new UntypedFormControl(
          { value: undefined, disabled: false },
          Validators.required
        ),
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
