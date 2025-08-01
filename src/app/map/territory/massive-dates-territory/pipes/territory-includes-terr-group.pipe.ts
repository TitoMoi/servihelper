import { Pipe, PipeTransform } from '@angular/core';
import { TerritoryGroupInterface } from 'app/map/model/map.model';

@Pipe({
  name: 'territoryIncludesTerrGroupPipe',
  standalone: true
})
export class TerritoryIncludesTerrGroupPipe implements PipeTransform {
  transform(terrigoryGroupsId: string[], territoryGroup: TerritoryGroupInterface): boolean {
    return terrigoryGroupsId.some(tgId => tgId === territoryGroup.id);
  }
}
