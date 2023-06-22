import { Pipe, PipeTransform } from "@angular/core";
import { SheetTitleService } from "../service/sheet-title.service";
import { SheetTitleInterface } from "../model/sheet-title.model";

@Pipe({
  name: "sheetTitlePipe",
  standalone: true,
})
export class SheetTitlePipe implements PipeTransform {
  constructor(private sheetTitleService: SheetTitleService) {}
  /**Given the id of the sheet title return the sheet title */
  transform(id: string): SheetTitleInterface | undefined {
    return this.sheetTitleService.getTitle(id);
  }
}
