import { Pipe, PipeTransform } from "@angular/core";
import { AssignTypeInterface } from "../model/assigntype.model";
import { AssignTypeService } from "../service/assigntype.service";

@Pipe({
  name: "assignTypeNamePipe",
  standalone: true,
})
export class AssignTypeNamePipe implements PipeTransform {
  constructor(private assignTypeService: AssignTypeService) {}

  transform(at: AssignTypeInterface): string {
    return this.assignTypeService.getNameOrTranslation(at);
  }
}
