import { AssignmentService } from "app/assignment/service/assignment.service";
import { NoteService } from "app/note/service/note.service";

import { Component, inject } from "@angular/core";
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
    imports: [
        TranslocoModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        RouterLink,
        AsyncPipe,
        MatIconModule,
    ]
})
export class DeleteNoteComponent {
  private formBuilder = inject(UntypedFormBuilder);
  private noteService = inject(NoteService);
  private assignmentService = inject(AssignmentService);
  private router = inject(Router);
  private onlineService = inject(OnlineService);
  private activatedRoute = inject(ActivatedRoute);

  note = this.noteService.getNote(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  noteForm = this.formBuilder.group({
    id: this.note.id,
    name: [{ value: this.note.name, disabled: true }, Validators.required],
  });

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
