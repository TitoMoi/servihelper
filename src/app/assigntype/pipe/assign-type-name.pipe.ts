import { Pipe, PipeTransform } from "@angular/core";
import { AssignTypeInterface } from "../model/assigntype.model";
import { AssignTypeService } from "../service/assigntype.service";

//We need the pipe becomes injectable for excel.service.ts
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
