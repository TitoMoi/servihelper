import { AssignmentService } from "app/assignment/service/assignment.service";
import { NoteService } from "app/note/service/note.service";

import { Component } from "@angular/core";
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule } from "@ngneat/transloco";
import { OnlineService } from "app/online/service/online.service";
import { AsyncPipe } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-delete-note",
  templateUrl: "./delete-note.component.html",
  styleUrls: ["./delete-note.component.css"],
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    AsyncPipe,
    MatIconModule
],
})
export class DeleteNoteComponent {
  note = this.noteService.getNote(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  noteForm = this.formBuilder.group({
    id: this.note.id,
    name: [{ value: this.note.name, disabled: true }, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private noteService: NoteService,
    private assignmentService: AssignmentService,
    private router: Router,
    private onlineService: OnlineService,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit(): void {
    const note = this.noteForm.value;
    //Delete the note
    this.noteService.deleteNote(note.id);

    //Reset note for the assignments
    this.assignmentService.resetAssignmentsByNote(note.id);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
