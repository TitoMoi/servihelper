import { Pipe, PipeTransform } from "@angular/core";
import { AssignTypeService } from "../service/assignType.service";

@Pipe({
  name: "assignTypePipe",
})
export class AssignTypePipe implements PipeTransform {
  constructor(private assignTypeService: AssignTypeService) {}
  /**Given the id of the assignType return the name */
  transform(id: string): string {
    return this.assignTypeService.getAssignType(id)?.name;
  }
}
