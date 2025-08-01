import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";

import { Component, OnInit } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { AsyncPipe } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { TranslocoModule } from "@ngneat/transloco";
import { OnlineService } from "app/online/service/online.service";

@Component({
    selector: "app-note",
    templateUrl: "./note.component.html",
    styleUrls: ["./note.component.scss"],
    imports: [
        TranslocoModule,
        MatButtonModule,
        RouterLink,
        RouterLinkActive,
        MatIconModule,
        AsyncPipe,
    ]
})
export class NoteComponent implements OnInit {
  notes: NoteInterface[];

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  constructor(
    private noteService: NoteService,
    private onlineService: OnlineService,
  ) {}

  ngOnInit(): void {
    this.notes = this.noteService.getNotes();
  }
}
