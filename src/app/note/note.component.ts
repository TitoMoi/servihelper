import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";

import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-note",
  templateUrl: "./note.component.html",
  styleUrls: ["./note.component.scss"],
})
export class NoteComponent implements OnInit {
  notes: NoteInterface[];

  constructor(private noteService: NoteService) {}

  ngOnInit(): void {
    this.notes = this.noteService.getNotes();
  }
}
