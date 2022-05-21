import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";

@Component({
  selector: "app-delete-note",
  templateUrl: "./delete-note.component.html",
  styleUrls: ["./delete-note.component.css"],
})
export class DeleteNoteComponent implements OnInit {
  noteForm;

  constructor(
    private formBuilder: FormBuilder,
    private noteService: NoteService,
    private assignmentService: AssignmentService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.noteForm = this.formBuilder.group({
      id: undefined,
      name: [undefined, Validators.required],
    });

    this.activatedRoute.params.subscribe((params) => {
      const note = this.noteService.getNote(params.id);
      this.noteForm.setValue({
        id: params.id,
        name: note.name,
      });
    });
  }

  onSubmit(note: NoteInterface): void {
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
