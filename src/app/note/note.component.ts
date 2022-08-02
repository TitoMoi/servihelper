import { NoteInterface, NoteTableInterface } from 'app/note/model/note.model';
import { NoteService } from 'app/note/service/note.service';

import { Component, OnInit } from '@angular/core';

@Component({
  selector: "app-note",
  templateUrl: "./note.component.html",
  styleUrls: ["./note.component.scss"],
})
export class NoteComponent implements OnInit {
  notes: NoteInterface[];

  //Table
  displayedColumns: string[] = ["name", "editIcon", "deleteIcon"];

  dataSource: NoteTableInterface[];

  constructor(private noteService: NoteService) {}

  ngOnInit(): void {
    this.notes = this.noteService.getNotes();
    this.fillDataSource(this.notes);
  }

  trackByIdFn(index, note: NoteInterface) {
    return note.id;
  }

  fillDataSource(notesPage: NoteInterface[]) {
    const dataSourceTemp: NoteTableInterface[] = [];
    for (const note of notesPage) {
      //Populate datasource, values is in order
      dataSourceTemp.push({
        id: note.id,
        name: note.name,
      });
    }
    //Update the view
    this.dataSource = dataSourceTemp;
  }
}
