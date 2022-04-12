import { Component, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { NoteInterface, NoteTableInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";

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

  //icons
  icons: string[];

  constructor(
    private noteService: NoteService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.icons = ["garbage", "edit"];
  }

  async ngOnInit(): Promise<void> {
    //Register icons
    for (const iconFileName of this.icons) {
      this.matIconRegistry.addSvgIcon(
        iconFileName,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          "assets/icons/" + iconFileName + ".svg"
        )
      );
    }

    this.notes = await this.noteService.getNotes();
    await this.fillDataSource(this.notes);
  }

  trackByIdFn(index, note: NoteInterface) {
    return note.id;
  }

  async fillDataSource(notesPage: NoteInterface[]) {
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
