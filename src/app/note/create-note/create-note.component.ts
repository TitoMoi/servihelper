import { editorJsonToHtml } from "app/functions/editorJsonToHtml";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { Editor, toHTML, Toolbar } from "ngx-editor";

import { Component, OnDestroy } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-create-note",
  templateUrl: "./create-note.component.html",
  styleUrls: ["./create-note.component.css"],
})
export class CreateNoteComponent implements OnDestroy {
  noteForm: UntypedFormGroup = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
    editorContent: new UntypedFormControl(
      { value: undefined, disabled: false },
      Validators.required
    ),
  });
  editor: Editor = new Editor();

  toolbar: Toolbar = [["bold"], ["italic"], ["underline"]];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private noteService: NoteService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  onSubmit(note: NoteInterface): void {
    note.editorHTML = editorJsonToHtml(note.editorContent);

    this.noteService.createNote(note);

    //navigate to parent
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }
}
