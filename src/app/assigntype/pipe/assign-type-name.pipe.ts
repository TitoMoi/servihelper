import { Pipe, PipeTransform, inject } from '@angular/core';
import { AssignTypeInterface } from '../model/assigntype.model';
import { AssignTypeService } from '../service/assigntype.service';

@Pipe({
  name: 'assignTypeNamePipe',
  standalone: true
})
export class AssignTypeNamePipe implements PipeTransform {
  private assignTypeService = inject(AssignTypeService);

  transform(at: AssignTypeInterface): string {
    return this.assignTypeService.getNameOrTranslation(at);
  }
}
