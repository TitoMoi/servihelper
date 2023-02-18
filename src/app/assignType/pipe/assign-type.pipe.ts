import { Pipe, PipeTransform } from "@angular/core";
import { AssignTypeInterface } from "../model/assignType.model";
import { AssignTypeService } from "../service/assignType.service";

@Pipe({
  name: "assignTypePipe",
})
export class AssignTypePipe implements PipeTransform {
  constructor(private assignTypeService: AssignTypeService) {}
  /**Given the id of the assignType return the assignType */
  transform(id: string): AssignTypeInterface {
    return this.assignTypeService.getAssignType(id);
  }
}
