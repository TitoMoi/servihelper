import { AssignmentService } from "app/assignment/service/assignment.service";
import { NoteService } from "app/note/service/note.service";

import { Component } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-delete-note",
  templateUrl: "./delete-note.component.html",
  styleUrls: ["./delete-note.component.css"],
})
export class DeleteNoteComponent {
  note = this.noteService.getNote(this.activatedRoute.snapshot.params.id);

  noteForm = this.formBuilder.group({
    id: this.note.id,
    name: [{ value: this.note.name, disabled: true }, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private noteService: NoteService,
    private assignmentService: AssignmentService,
    private router: Router,
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
