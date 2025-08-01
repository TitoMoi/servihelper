import { Pipe, PipeTransform, inject } from '@angular/core';
import { AssignTypeInterface } from '../model/assigntype.model';
import { AssignTypeService } from '../service/assigntype.service';

@Pipe({
  name: 'assignTypePipe',
  standalone: true
})
export class AssignTypePipe implements PipeTransform {
  private assignTypeService = inject(AssignTypeService);

  /**Given the id of the assignType return the assignType */
  transform(id: string): AssignTypeInterface {
    return this.assignTypeService.getAssignType(id);
  }
}
