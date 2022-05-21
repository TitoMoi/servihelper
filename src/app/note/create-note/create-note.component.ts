import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { editorJsonToHtml } from "app/functions/editorJsonToHtml";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { Editor, Toolbar, toHTML } from "ngx-editor";
@Component({
  selector: "app-create-note",
  templateUrl: "./create-note.component.html",
  styleUrls: ["./create-note.component.css"],
})
export class CreateNoteComponent implements OnInit, OnDestroy {
  noteForm: FormGroup;
  editor: Editor;

  toolbar: Toolbar;

  constructor(
    private formBuilder: FormBuilder,
    private noteService: NoteService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.noteForm = this.formBuilder.group({
      id: undefined,
      name: [undefined, Validators.required],
      editorContent: new FormControl(
        { value: undefined, disabled: false },
        Validators.required
      ),
    });

    this.toolbar = [["bold"], ["italic"], ["underline"]];
    this.editor = new Editor();
  }
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
