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
  FormControl,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { AutoFocusDirective } from "../../directives/autofocus/autofocus.directive";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { TranslocoModule } from "@ngneat/transloco";
import { OnlineService } from "app/online/service/online.service";
import { AsyncPipe } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatCheckboxModule } from "@angular/material/checkbox";

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
    MatCheckboxModule,
    RouterLink,
    AsyncPipe,
    MatIconModule,
  ],
})
export class CreateUpdateNoteComponent implements OnDestroy {
  n = this.noteService.getNote(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  isUpdate = this.n ? true : false;

  editor: Editor = new Editor();
  toolbar: Toolbar = [["bold"], ["italic"], ["underline"], ["bullet_list"]];

  form: UntypedFormGroup = this.formBuilder.group({
    id: this.n?.id,
    name: new FormControl(this.n?.name, { validators: Validators.required }),
    showInHome: [this.n ? this.n.showInHome : false],
    editorContent: this.n
      ? this.n.editorContent
      : new UntypedFormControl({ value: undefined, disabled: false }, Validators.required),
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private noteService: NoteService,
    private router: Router,
    private onlineService: OnlineService,
    private activatedRoute: ActivatedRoute,
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
