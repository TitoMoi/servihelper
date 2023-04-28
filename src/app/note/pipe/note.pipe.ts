import { Pipe, PipeTransform } from "@angular/core";
import { NoteInterface } from "../model/note.model";
import { NoteService } from "../service/note.service";

@Pipe({
  name: "notePipe",
  standalone: true,
})
export class NotePipe implements PipeTransform {
  constructor(private noteService: NoteService) {}
  /**Given the id of the note return the name */
  transform(id: string): NoteInterface {
    return this.noteService.getNote(id);
  }
}
