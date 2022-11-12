import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "isRoleCheckedPipe",
})
export class IsRoleCheckedPipe implements PipeTransform {
  transform(atId: string, assignTypesId: string[]): boolean {
    return assignTypesId.indexOf(atId) > -1;
  }
}
