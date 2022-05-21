import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { Editor, Toolbar } from "ngx-editor";
import { editorJsonToHtml } from "app/functions/editorJsonToHtml";
@Component({
  selector: "app-update-note",
  templateUrl: "./update-note.component.html",
  styleUrls: ["./update-note.component.css"],
})
export class UpdateNoteComponent implements OnInit, OnDestroy {
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

    this.activatedRoute.params.subscribe((params) => {
      const note = this.noteService.getNote(params.id);
      this.noteForm.setValue({
        id: params.id,
        name: note.name,
        editorContent: note.editorContent,
      });
    });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  onSubmit(note: NoteInterface): void {
    note.editorHTML = editorJsonToHtml(note.editorContent);

    this.noteService.updateNote(note);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
