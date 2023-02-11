import { Pipe, PipeTransform } from "@angular/core";
import { NoteService } from "../service/note.service";

@Pipe({
  name: "notePipe",
})
export class NotePipe implements PipeTransform {
  constructor(private noteService: NoteService) {}
  /**Given the id of the note return the name */
  transform(id: string): string {
    return this.noteService.getNote(id)?.name;
  }
}
