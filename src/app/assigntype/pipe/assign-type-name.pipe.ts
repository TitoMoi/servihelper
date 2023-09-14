import { Injectable, Pipe, PipeTransform } from "@angular/core";
import { AssignTypeInterface } from "../model/assigntype.model";
import { TranslocoService } from "@ngneat/transloco";

//We need the pipe becomes injectable for excel.service.ts
@Pipe({
  name: "assignTypeNamePipe",
  standalone: true,
})
@Injectable({
  providedIn: "root",
})
export class AssignTypeNamePipe implements PipeTransform {
  constructor(private translocoService: TranslocoService) {}

  transform(at: AssignTypeInterface): string {
    return at.name ? at.name : this.translocoService.translate(at.tKey);
  }
}
