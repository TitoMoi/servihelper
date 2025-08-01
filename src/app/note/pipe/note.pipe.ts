import { Pipe, PipeTransform, inject } from "@angular/core";
import { NoteInterface } from "../model/note.model";
import { NoteService } from "../service/note.service";

@Pipe({
  name: "notePipe",
  standalone: true,
})
export class NotePipe implements PipeTransform {
  private noteService = inject(NoteService);

  /**Given the id of the note return the name */
  transform(id: string): NoteInterface {
    return this.noteService.getNote(id);
  }
}
