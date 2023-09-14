import { Pipe, PipeTransform } from "@angular/core";
import { AssignTypeInterface } from "../model/assigntype.model";
import { TranslocoService } from "@ngneat/transloco";

@Pipe({
  name: "assignTypeNamePipe",
  standalone: true,
})
export class AssignTypeNamePipe implements PipeTransform {
  constructor(private translocoService: TranslocoService) {}

  transform(at: AssignTypeInterface): string {
    return at.name ? at.name : this.translocoService.translate(at.tKey);
  }
}
