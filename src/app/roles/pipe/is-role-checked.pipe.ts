import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isRoleCheckedPipe',
  standalone: true
})
export class IsRoleCheckedPipe implements PipeTransform {
  transform(atId: string, assignTypesId: string[]): boolean {
    return assignTypesId.indexOf(atId) > -1;
  }
}
